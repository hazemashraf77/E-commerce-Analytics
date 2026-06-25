/**
 * EasyOrders Webhook Service — Sprint 1.5A
 *
 * Handles Order and Order Status Update events from EasyOrders.
 *
 * Order detail fetch uses the EasyOrders Public API:
 *   GET https://api.easy-orders.net/api/v1/external-apps/orders/:order_id
 *   Header: Api-Key: <EAZY_ORDER_API_KEY>
 *
 * NO dashboard JWT. NO /api/v1/orders list endpoint. NO auth login.
 * Only the Public API with the store Api-Key.
 *
 * After fetching, the order is upserted using the same logic as the
 * Sprint 1 batch sync (processOrder pattern). Providers stay isolated.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { OrderStatus, PaymentStatus, MarketingPlatform } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";

const logger = createLogger("EasyOrdersWebhookService");

// Public API base — always https://api.easy-orders.net
function getEasyOrdersApiBase(): string {
  return (getServerEnv().EAZY_ORDER_STORE_URL ?? "https://api.easy-orders.net").replace(/\/$/, "");
}

// ── Event type detection ───────────────────────────────────────────────────

export type EasyOrdersEventType =
  | "order.created"
  | "order.status_updated"
  | "order.confirmed"
  | "order.shipped"
  | "order.delivered"
  | "order.cancelled"
  | "order.returned"
  | "unknown";

/**
 * Detect event type from payload.
 * Exported so the route can call it before choosing the webhook secret.
 */
export function detectEventType(payload: Record<string, unknown>): EasyOrdersEventType {
  const raw = String(payload.event_type ?? payload.event ?? payload.type ?? payload.action ?? "")
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  if (!raw) {
    // No event field — try to infer from payload shape
    const hasStatusOnly = payload.status && !payload.items && !payload.order_items;
    return hasStatusOnly ? "order.status_updated" : "order.created";
  }

  if (raw.includes("creat") || raw.includes("new")) return "order.created";
  if (raw.includes("status") || raw.includes("update")) return "order.status_updated";
  if (raw.includes("confirm")) return "order.confirmed";
  if (raw.includes("ship") && !raw.includes("status")) return "order.shipped";
  if (raw.includes("deliv")) return "order.delivered";
  if (raw.includes("cancel")) return "order.cancelled";
  if (raw.includes("return") || raw.includes("refund")) return "order.returned";

  const hasOrderData = payload.order_id ?? payload.data ?? payload.order;
  return hasOrderData ? "order.status_updated" : "unknown";
}

/**
 * Returns true for Order (new order) events.
 * Returns false for Order Status Update events.
 * Used by the route to pick the correct webhook secret.
 */
export function isOrderEvent(eventType: EasyOrdersEventType): boolean {
  return eventType === "order.created";
}

// ── Status maps (same as Sprint 1 batch sync) ─────────────────────────────

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  new: "PENDING",
  pending: "PENDING",
  draft: "DRAFT",
  confirmed: "CONFIRMED",
  processing: "PROCESSING",
  preparing: "PROCESSING",
  ready: "READY_TO_SHIP",
  ready_to_ship: "READY_TO_SHIP",
  shipped: "SHIPPED",
  in_transit: "SHIPPED",
  out_for_delivery: "SHIPPED",
  delivered: "DELIVERED",
  completed: "DELIVERED",
  closed: "CLOSED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
  returned: "CANCELLED",
  refunded: "CLOSED",
  on_hold: "PENDING",
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  cod: "PENDING",
  cash: "PENDING",
  online: "PAID",
  prepaid: "PAID",
  paid: "PAID",
  free: "PAID",
};

const MARKETING_PLATFORM_MAP: Record<string, MarketingPlatform> = {
  meta: "META",
  facebook: "META",
  fb: "META",
  tiktok: "TIKTOK",
  tt: "TIKTOK",
  direct: "DIRECT",
  organic: "ORGANIC",
  referral: "REFERRAL",
};

// ── Result type ────────────────────────────────────────────────────────────

export interface WebhookHandleResult {
  outcome: "processed" | "duplicate" | "ignored" | "failed";
  eventType: EasyOrdersEventType;
  externalId: string;
  orderId?: string;
  errorMessage?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractOrderId(payload: Record<string, unknown>): string {
  const data =
    payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : undefined;

  const order =
    payload.order && typeof payload.order === "object" && !Array.isArray(payload.order)
      ? (payload.order as Record<string, unknown>)
      : undefined;

  const status =
    payload.status && typeof payload.status === "object" && !Array.isArray(payload.status)
      ? (payload.status as Record<string, unknown>)
      : undefined;

  const possible = [
    // top-level direct fields
    payload.order_id,
    payload.orderId,
    payload.order_uuid,
    payload.orderUuid,
    payload.uuid,

    // EasyOrders sometimes sends the order id directly in generic fields
    payload.id,
    payload.order,
    payload.entity_id,
    payload.entityId,
    payload.resource_id,
    payload.resourceId,
    payload.object_id,
    payload.objectId,
    payload.model_id,
    payload.modelId,
    payload.reference_id,
    payload.referenceId,

    // data object fields
    data?.order_id,
    data?.orderId,
    data?.order_uuid,
    data?.orderUuid,
    data?.uuid,
    data?.id,
    data?.order,
    data?.entity_id,
    data?.entityId,
    data?.resource_id,
    data?.resourceId,
    data?.object_id,
    data?.objectId,
    data?.model_id,
    data?.modelId,
    data?.reference_id,
    data?.referenceId,

    // order object fields
    order?.id,
    order?.uuid,
    order?.order_id,
    order?.orderId,

    // status object fields
    status?.order_id,
    status?.orderId,
    status?.order_uuid,
    status?.orderUuid,
    status?.uuid,
    status?.id,
  ];

  const found = possible.find((v) => typeof v === "string" && v.trim());
  return found ? String(found).trim() : "";
}

function buildExternalId(
  payload: Record<string, unknown>,
  orderId: string,
  eventType: string,
): string {
  const explicit = String(payload.event_id ?? payload.id ?? "").trim();
  if (explicit) return `eo:${explicit}`;

  const timestamp = String(
    payload.updated_at ?? payload.created_at ?? payload.timestamp ?? "",
  ).trim();
  if (orderId) return `eo:${orderId}:${eventType}:${timestamp || "latest"}`;

  return `eo:unknown:${eventType}:${timestamp || Date.now()}`;
}

// ── Public API order fetch ─────────────────────────────────────────────────

/**
 * Fetch a single order from the EasyOrders Public API.
 * Uses GET /api/v1/external-apps/orders/:order_id
 * Header: Api-Key: <EAZY_ORDER_API_KEY>
 * Base URL: https://api.easy-orders.net
 *
 * No dashboard login. No JWT. No /api/v1/orders list.
 */
async function fetchOrderFromPublicApi(
  orderId: string,
  apiKey: string,
): Promise<Record<string, unknown> | null> {
  const baseUrl = getEasyOrdersApiBase();
  const url = `${baseUrl}/api/v1/external-apps/orders/${encodeURIComponent(orderId)}`;

  logger.info("EasyOrders webhook: fetching order from Public API", {
    metadata: { orderId, url },
  });

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Api-Key": apiKey,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (res.status === 404) {
    logger.warn("EasyOrders webhook: order not found in Public API", { metadata: { orderId } });
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EasyOrders Public API ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as Record<string, unknown>;

  // API may wrap data under .data or .order
  const order = (
    json.data && typeof json.data === "object" && !Array.isArray(json.data)
      ? json.data
      : json.order && typeof json.order === "object"
        ? json.order
        : json
  ) as Record<string, unknown>;

  return order;
}

// ── Order upsert (same pattern as Sprint 1 batch sync) ────────────────────

async function upsertOrder(storeId: string, order: Record<string, unknown>): Promise<void> {
  const providerOrderId = String(order.id ?? order.uuid ?? order.order_id ?? "").trim();
  if (!providerOrderId) throw new Error("Order has no id");

  const statusRaw = String(order.status ?? "new")
    .toLowerCase()
    .replace(/-/g, "_");
  const orderStatus = ORDER_STATUS_MAP[statusRaw] ?? ("PENDING" as OrderStatus);

  const payMethodRaw = String(order.payment_method ?? "cod").toLowerCase();
  const paymentStatus = PAYMENT_STATUS_MAP[payMethodRaw] ?? ("UNKNOWN" as PaymentStatus);

  const feeRaw = parseFloat(String(order.customer_shipping_fee ?? order.shipping_fee ?? "0"));
  const customerShippingFee = new Decimal(isFinite(feeRaw) ? feeRaw : 0);

  const mktRaw = order.marketing_source ?? order.source;
  const marketingSource: MarketingPlatform | null = mktRaw
    ? (MARKETING_PLATFORM_MAP[String(mktRaw).toLowerCase()] ?? "UNKNOWN")
    : null;

  const orderDate = order.created_at ? new Date(String(order.created_at)) : new Date();
  if (isNaN(orderDate.getTime())) orderDate.setTime(Date.now());

  await prisma.order.upsert({
    where: {
      storeId_provider_providerOrderId: {
        storeId,
        provider: "EASYORDERS",
        providerOrderId,
      },
    },
    update: {
      orderStatus,
      paymentStatus,
      customerShippingFee,
      syncedAt: new Date(),
    },
    create: {
      storeId,
      provider: "EASYORDERS",
      providerOrderId,
      orderDate,
      customerShippingFee,
      paymentMethod: payMethodRaw,
      paymentStatus,
      orderStatus,
      marketingSource,
      syncedAt: new Date(),
    },
  });

  // Order items: same two-path logic as Sprint 1 batch sync.
  // Product found by SKU → OrderItem with FK.
  // No match → ImportStaging for Sprint 2 resolution.
  const dbOrder = await prisma.order.findUnique({
    where: {
      storeId_provider_providerOrderId: {
        storeId,
        provider: "EASYORDERS",
        providerOrderId,
      },
    },
    select: { id: true },
  });
  if (!dbOrder) return;

  const items = (
  Array.isArray(order.cart_items)
    ? order.cart_items
    : Array.isArray(order.items)
      ? order.items
      : Array.isArray(order.order_items)
        ? order.order_items
        : []
) as Record<string, unknown>[];
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (!item) continue;
    try {
      await upsertOrderItem(storeId, dbOrder.id, providerOrderId, item, idx);
    } catch (err) {
      logger.warn("EasyOrders webhook: order item failed", {
        metadata: { providerOrderId, idx, error: String(err) },
      });
    }
  }
}

async function upsertOrderItem(
  storeId: string,
  orderId: string,
  providerOrderId: string,
  item: Record<string, unknown>,
  itemIdx: number,
): Promise<void> {
  const providerProduct =
    item.product && typeof item.product === "object" && !Array.isArray(item.product)
      ? (item.product as Record<string, unknown>)
      : null;

  const sku = String(
    item.sku ??
      item.product_sku ??
      providerProduct?.sku ??
      providerProduct?.slug ??
      "",
  ).trim();

  const provProductId = String(
    item.product_id ??
      providerProduct?.id ??
      item.id ??
      "",
  ).trim();

  const productName = String(
    item.product_name ??
      item.name ??
      providerProduct?.name ??
      "",
  ).trim();

  const qtyRaw = parseFloat(String(item.quantity ?? "1"));
  const priceRaw = parseFloat(String(item.unit_price ?? item.price ?? providerProduct?.price ?? "0"));
  const discRaw = parseFloat(String(item.discount ?? "0"));

  const quantity = new Decimal(isFinite(qtyRaw) ? qtyRaw : 1);
  const unitPrice = new Decimal(isFinite(priceRaw) ? priceRaw : 0);
  const discount = new Decimal(isFinite(discRaw) ? discRaw : 0);

  const matchedProduct = sku
    ? await prisma.product
        .findUnique({
          where: { storeId_sku: { storeId, sku } },
          select: { id: true },
        })
        .catch(() => null)
    : null;

  if (matchedProduct) {
    const existing = await prisma.orderItem.findFirst({
      where: { orderId, productId: matchedProduct.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: { quantity, unitPrice, discount },
      });
    } else {
      await prisma.orderItem.create({
        data: { orderId, productId: matchedProduct.id, quantity, unitPrice, discount },
      });
    }
    return;
  }

  const externalId = `${providerOrderId}:item:${itemIdx}`;

  const rawPayload = JSON.parse(JSON.stringify({
    provider_order_id: providerOrderId,
    order_db_id: orderId,
    item_index: itemIdx,
    product_id: provProductId,
    sku,
    product_name: productName,
    quantity: qtyRaw,
    unit_price: priceRaw,
    discount: discRaw,
    raw: item,
  }));

  const stagingExisting = await prisma.importStaging.findFirst({
    where: { provider: "EASYORDERS", externalId },
    select: { id: true },
  });

  if (stagingExisting) {
    await prisma.importStaging.update({
      where: { id: stagingExisting.id },
      data: { rawPayload, processedAt: null, status: "PENDING", retryCount: 0 },
    });
  } else {
    await prisma.importStaging.create({
      data: {
        provider: "EASYORDERS",
        entityType: "ORDER_ITEM",
        externalId,
        rawPayload,
        status: "PENDING",
      },
    });
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function handleEasyOrdersWebhook(
  payload: Record<string, unknown>,
  rawHeaders: Record<string, string>,
  eventType: EasyOrdersEventType, // pre-detected by route
): Promise<WebhookHandleResult> {
  const orderId = extractOrderId(payload);
  const externalId = buildExternalId(payload, orderId, eventType);

  logger.info("EasyOrders webhook received", {
    metadata: { eventType, externalId, orderId },
  });

  // ── Idempotency ──────────────────────────────────────────────────────────
  const existing = await prisma.webhookLog
    .findUnique({
      where: { provider_externalId: { provider: "EASYORDERS", externalId } },
      select: { id: true, status: true },
    })
    .catch(() => null);

  if (existing) {
    logger.info("EasyOrders webhook duplicate — ignoring", {
      metadata: { externalId, previousStatus: existing.status },
    });
    return { outcome: "duplicate", eventType, externalId, orderId: orderId || undefined };
  }

  // ── Log ──────────────────────────────────────────────────────────────────
  const safeHeaders: Record<string, string> = {};
  for (const h of [
    "content-type",
    "secret",
    "x-webhook-secret",
    "webhook-secret",
    "x-request-id",
    "user-agent",
  ]) {
    if (rawHeaders[h]) safeHeaders[h] = rawHeaders[h];
  }

  const log = await prisma.webhookLog
    .create({
      data: {
        provider: "EASYORDERS",
        eventType,
        externalId,
        payload: payload as object,
        headers: safeHeaders as object,
        status: "RECEIVED",
      },
    })
    .catch((err) => {
      logger.error("EasyOrders webhook: log create failed", { metadata: { error: String(err) } });
      return null;
    });

  // ── Validate ─────────────────────────────────────────────────────────────
  if (eventType === "unknown") {
    logger.info("EasyOrders webhook: ignoring — unknown event type", {
      metadata: { eventType, orderId, externalId },
    });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "IGNORED", errorMessage: "Unknown event type" },
        })
        .catch(() => {});
    }
    return { outcome: "ignored", eventType, externalId };
  }

  if (!orderId) {
    logger.warn("EasyOrders webhook: ignoring — missing orderId", {
      metadata: { eventType, externalId },
    });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "IGNORED", errorMessage: "Missing orderId" },
        })
        .catch(() => {});
    }
    return {
      outcome: "ignored",
      eventType,
      externalId,
      errorMessage: "Missing orderId",
    };
  }

  // ── Store ────────────────────────────────────────────────────────────────
  const store = await prisma.store.findFirst({ select: { id: true } }).catch(() => null);
  if (!store) {
    const errorMessage = "No store found in database";
    logger.error("EasyOrders webhook: no store", { metadata: { externalId } });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "FAILED", errorMessage },
        })
        .catch(() => {});
    }
    return { outcome: "failed", eventType, externalId, orderId, errorMessage };
  }

  // ── Fetch order from Public API and upsert ───────────────────────────────
  try {
    const env = getServerEnv();

    if (!env.EAZY_ORDER_API_KEY) {
      throw new Error("EAZY_ORDER_API_KEY not configured");
    }

    logger.info("EasyOrders webhook: fetching order via Public API", {
      metadata: { orderId, eventType },
    });

    const orderData = await fetchOrderFromPublicApi(orderId, env.EAZY_ORDER_API_KEY);



    if (!orderData) {
      // Order returned 404 — nothing to upsert
      logger.warn("EasyOrders webhook: order not found in Public API — ignoring", {
        metadata: { orderId, externalId },
      });
      if (log) {
        await prisma.webhookLog
          .update({
            where: { id: log.id },
            data: { status: "IGNORED" },
          })
          .catch(() => {});
      }
      return { outcome: "ignored", eventType, externalId, orderId };
    }

    await upsertOrder(store.id, orderData);

    logger.info("EasyOrders webhook processed", {
      metadata: { eventType, orderId, externalId },
    });

    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        })
        .catch(() => {});
    }

    return { outcome: "processed", eventType, externalId, orderId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("EasyOrders webhook: processing failed", {
      metadata: { eventType, orderId, externalId, error: errorMessage },
    });
    if (log) {
      await prisma.webhookLog
        .update({
          where: { id: log.id },
          data: { status: "FAILED", errorMessage: errorMessage.slice(0, 1000) },
        })
        .catch(() => {});
    }
    return { outcome: "failed", eventType, externalId, orderId, errorMessage };
  }
}
