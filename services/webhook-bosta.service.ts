/**
 * Bosta Webhook Service
 *
 * Handles shipment lifecycle events from Bosta.
 * Bosta sends events when shipment state changes.
 *
 * Event payload shape:
 * {
 *   event: "DELIVERY_STATUS_CHANGED",
 *   data: {
 *     _id: "...",
 *     trackingNumber: "...",
 *     businessReference: "...",  // EasyOrders UUID for orders sent to Bosta
 *     state: { code: 60, value: "Delivered" },
 *     ...
 *   }
 * }
 *
 * Processes Bosta webhook payload directly and upserts shipment only for orders that were actually sent to Bosta.
 * Processing is synchronous within the Vercel invocation.
 */

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { mapBostaStatus } from "@/services/bosta-status.mapper";

const logger = createLogger("BostaWebhookService");

export interface BostaWebhookHandleResult {
  outcome: "processed" | "duplicate" | "ignored" | "failed";
  eventType: string;
  externalId: string;
  trackingNumber?: string;
  errorMessage?: string;
}

/**
 * Build a deterministic deduplication key for Bosta events.
 *
 * Bosta may not always send a unique event ID. When it does, we use it.
 * When it doesn't, we build a stable key from trackingNumber + state.code + updatedAt.
 * Using updatedAt (not Date.now()) ensures the same event always produces the same key.
 */
function buildBostaExternalId(
  payload: Record<string, unknown>,
  data: Record<string, unknown>,
  trackingNumber: string,
): string {
  const explicit = String(payload.eventId ?? payload.event_id ?? payload.id ?? "").trim();
  if (explicit) return `bosta:${explicit}`;

  const stateCode = (data.state as Record<string, unknown>)?.code ?? "";
  const updatedAt = String(data.updatedAt ?? data.updated_at ?? "").trim();

  if (trackingNumber && stateCode && updatedAt) {
    return `bosta:${trackingNumber}:${stateCode}:${updatedAt}`;
  }

  // Last resort — tracking + state only (may cause idempotency issues on rapid updates)
  if (trackingNumber && stateCode) {
    return `bosta:${trackingNumber}:${stateCode}`;
  }

  // Truly unknown — can't deduplicate reliably; create unique key to at least store it
  return `bosta:unknown:${Date.now()}`;
}

/**
 * Handle an incoming Bosta webhook event.
 * Processes synchronously before returning so Vercel doesn't terminate early.
 */
async function upsertShipmentFromWebhookPayload(
  storeId: string,
  data: Record<string, unknown>,
  trackingNumber: string,
): Promise<"UPSERTED" | "ORDER_NOT_FOUND"> {
  const state =
    data.state && typeof data.state === "object" && !Array.isArray(data.state)
      ? (data.state as Record<string, unknown>)
      : {};

  const stateCode = Number(state.code ?? data.stateCode ?? 0);
  const stateValue = String(state.value ?? data.stateValue ?? data.status ?? "").toLowerCase();

  const businessReference = String(
    data.businessReference ??
      data.business_reference ??
      data.orderReference ??
      data.order_reference ??
      "",
  ).trim();

  const mappedStatus = mapBostaStatus(stateCode, stateValue);
  const shipmentStatus = mappedStatus.shipmentStatus;

  const order = businessReference
    ? await prisma.order.findFirst({
        where: {
          storeId,
          provider: "EASYORDERS",
          providerOrderId: businessReference,
        },
        select: { id: true },
      })
    : null;

  if (!order) {
    logger.warn("Bosta webhook: order not found for businessReference", {
      metadata: { businessReference, trackingNumber },
    });
    return "ORDER_NOT_FOUND";
  }

  const actualShippingCost = new Decimal(0);
  const codAmount = new Decimal(0);
  const now = new Date();

  await prisma.shipment.upsert({
    where: {
      orderId: order.id,
    },
    update: {
      providerShipmentId: trackingNumber,
      shipmentStatus,
      deliveryDate: shipmentStatus === "DELIVERED" ? now : undefined,
      returnDate: shipmentStatus === "RETURNED" ? now : undefined,
      syncedAt: now,
    },
    create: {
      orderId: order.id,
      providerShipmentId: trackingNumber,
      shipmentStatus,
      deliveryDate: shipmentStatus === "DELIVERED" ? now : undefined,
      returnDate: shipmentStatus === "RETURNED" ? now : undefined,
      actualShippingCost,
      codAmount,
      syncedAt: now,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      shipmentStatus,
      orderStatus:
        shipmentStatus === "DELIVERED"
          ? "DELIVERED"
          : shipmentStatus === "RETURNED" || shipmentStatus === "DELIVERY_FAILED"
            ? "CANCELLED"
            : undefined,
      syncedAt: now,
    },
  });

  return "UPSERTED";
}
export async function handleBostaWebhook(
  payload: Record<string, unknown>,
  rawHeaders: Record<string, string>,
): Promise<BostaWebhookHandleResult> {
  // Normalise payload — Bosta may send data at top level or nested under `data`
  const data = (
    payload.data && typeof payload.data === "object" ? payload.data : payload
  ) as Record<string, unknown>;

  const eventType = String(payload.event ?? payload.type ?? "DELIVERY_STATUS_CHANGED");
  const trackingNumber = String(
    data.trackingNumber ?? data.tracking_number ?? data._id ?? "",
  ).trim();

  const externalId = buildBostaExternalId(payload, data, trackingNumber);

  logger.info("Bosta webhook received", {
    metadata: {
      eventType,
      trackingNumber,
      externalId,
      stateCode: (data.state as Record<string, unknown>)?.code,
      stateValue: (data.state as Record<string, unknown>)?.value,
      businessReference: data.businessReference ?? data.business_reference,
    },
  });

  // ── Idempotency check ────────────────────────────────────────────────────
  const existing = await prisma.webhookLog
    .findUnique({
      where: { provider_externalId: { provider: "BOSTA", externalId } },
      select: { id: true, status: true },
    })
    .catch(() => null);

  if (existing && existing.status !== "FAILED") {
    logger.info("Bosta webhook duplicate — ignoring", {
      metadata: { externalId, previousStatus: existing.status },
    });
    return {
      outcome: "duplicate",
      eventType,
      externalId,
      trackingNumber: trackingNumber || undefined,
    };
  }

  if (existing?.status === "FAILED") {
    logger.info("Bosta webhook retrying previously failed event", {
      metadata: { externalId, previousStatus: existing.status },
    });
  }

  // ── Log incoming event ───────────────────────────────────────────────────
  const safeHeaders: Record<string, string> = {};
  const ALLOWED_HEADERS = [
    "content-type",
    "x-bosta-signature",
    "x-hub-signature-256",
    "x-webhook-signature",
    "x-request-id",
    "user-agent",
  ];
  for (const h of ALLOWED_HEADERS) {
    if (rawHeaders[h]) safeHeaders[h] = rawHeaders[h];
  }

  const log = existing
    ? await prisma.webhookLog
        .update({
          where: { id: existing.id },
          data: {
            payload: payload as object,
            headers: safeHeaders as object,
            status: "RECEIVED",
            errorMessage: null,
            processedAt: null,
          },
        })
        .catch((err) => {
          logger.error("Bosta webhook: failed to reuse existing log entry", {
            metadata: { error: String(err) },
          });
          return null;
        })
    : await prisma.webhookLog
        .create({
          data: {
            provider: "BOSTA",
            eventType,
            externalId,
            payload: payload as object,
            headers: safeHeaders as object,
            status: "RECEIVED",
          },
        })
        .catch((err) => {
          logger.error("Bosta webhook: failed to create log entry", {
            metadata: { error: String(err) },
          });
          return null;
        });

  // ── Validate required fields ─────────────────────────────────────────────
  if (!trackingNumber) {
    logger.info("Bosta webhook: ignoring — no trackingNumber in payload", {
      metadata: { externalId, eventType },
    });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "IGNORED" },
        })
        .catch(() => {});
    }
    return { outcome: "ignored", eventType, externalId };
  }

  // ── Resolve store ────────────────────────────────────────────────────────
  const store = await prisma.store.findFirst({ select: { id: true } }).catch(() => null);
  if (!store) {
    const errorMessage = "No store found in database";
    logger.error("Bosta webhook: no store", { metadata: { externalId } });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "FAILED", errorMessage },
        })
        .catch(() => {});
    }
    return { outcome: "failed", eventType, externalId, trackingNumber, errorMessage };
  }

  // ── Process: sync the shipment ───────────────────────────────────────────
  try {
    logger.info("Bosta webhook: upserting shipment from webhook payload", {
      metadata: { trackingNumber, externalId, eventType },
    });

    const shipmentResult = await upsertShipmentFromWebhookPayload(store.id, data, trackingNumber);

    if (shipmentResult === "ORDER_NOT_FOUND") {
      if (log) {
        await prisma.webhookLog
          .update({
            where: { id: log.id },
            data: {
              status: "IGNORED",
              errorMessage: "Order not found for Bosta businessReference",
            },
          })
          .catch(() => {});
      }

      return { outcome: "ignored", eventType, externalId, trackingNumber };
    }

    logger.info("Bosta webhook processed", {
      metadata: { trackingNumber, externalId },
    });

    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        })
        .catch(() => {});
    }

    return { outcome: "processed", eventType, externalId, trackingNumber };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Bosta webhook: sync failed", {
      metadata: { trackingNumber, externalId, error: errorMessage },
    });

    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "FAILED", errorMessage: errorMessage.slice(0, 1000) },
        })
        .catch(() => {});
    }

    return { outcome: "failed", eventType, externalId, trackingNumber, errorMessage };
  }
}
