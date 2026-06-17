/**
 * POST /api/webhooks/easyorders
 *
 * Receives order lifecycle events from EasyOrders.
 * EasyOrders sends events to this URL when order status changes.
 *
 * Register this URL in EasyOrders:
 *   Settings → Webhooks → Add Webhook
 *   URL: https://yourdomain.vercel.app/api/webhooks/easyorders
 *   Events: order.created, order.confirmed, order.shipped, order.delivered,
 *            order.cancelled, order.returned, order.status_changed
 *
 * Security: validates X-EasyOrders-Signature (HMAC-SHA256 of payload with EAZY_ORDER_WEBHOOK_SECRET)
 */

import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { syncSingleOrder } from "@/services/sync.service";

const logger = createLogger("WebhookEasyOrders");

export const runtime = "nodejs"; // Required for crypto

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const rawBody = await request.text();

  // ── Signature verification ─────────────────────────────────────────────
  const signature = request.headers.get("x-easyorders-signature") ??
                    request.headers.get("x-webhook-signature") ?? "";

  if (env.EAZY_ORDER_WEBHOOK_SECRET) {
    const expected = createHmac("sha256", env.EAZY_ORDER_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");
    const expectedBuf = Buffer.from(`sha256=${expected}`, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");

    try {
      const valid = expectedBuf.length === signatureBuf.length &&
        timingSafeEqual(expectedBuf, signatureBuf);
      if (!valid) {
        logger.warn("EasyOrders webhook signature invalid", { metadata: { signature: signature.slice(0, 20) } });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      logger.warn("EasyOrders webhook signature check failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload.event_type ?? payload.event ?? payload.type ?? "unknown") as string;
  const eventId   = (payload.event_id ?? payload.id ?? crypto.randomUUID()) as string;
  const orderId   = (payload.order_id ?? payload.data?.id ?? payload.order?.id ?? "") as string;
  const storeId   = (payload.store_id ?? "") as string;

  logger.info("EasyOrders webhook received", { metadata: { eventType, eventId, orderId } });

  // ── Idempotency — ignore duplicate events ─────────────────────────────
  const existing = await prisma.webhookLog.findUnique({
    where: { provider_externalId: { provider: "EAZY_ORDER", externalId: eventId } },
  }).catch(() => null);

  if (existing) {
    logger.info("EasyOrders webhook duplicate — ignoring", { metadata: { eventId } });
    return NextResponse.json({ status: "duplicate", eventId });
  }

  // ── Log event ─────────────────────────────────────────────────────────
  const log = await prisma.webhookLog.create({
    data: {
      provider:   "EAZY_ORDER",
      eventType,
      externalId: eventId,
      payload:    payload as any,
      status:     "RECEIVED",
    },
  }).catch(() => null);

  // ── Process event ─────────────────────────────────────────────────────
  try {
    const resolvedStoreId = await resolveStoreId(storeId);
    if (!resolvedStoreId) {
      logger.warn("EasyOrders webhook: store not found", { metadata: { storeId } });
      return NextResponse.json({ status: "ignored", reason: "store_not_found" });
    }

    // Trigger incremental sync for this specific order
    if (orderId) {
      // Non-blocking — respond 200 immediately, process async
      setImmediate(async () => {
        try {
          await syncSingleOrder(resolvedStoreId, orderId);
          if (log) {
            await prisma.webhookLog.update({
              where: { id: log.id },
              data: { status: "PROCESSED", processedAt: new Date() },
            }).catch(() => {});
          }
        } catch (err) {
          logger.error("EasyOrders webhook processing failed", { metadata: { eventId, orderId, error: String(err) } });
          if (log) {
            await prisma.webhookLog.update({
              where: { id: log.id },
              data: { status: "FAILED", errorMessage: String(err) },
            }).catch(() => {});
          }
        }
      });
    } else {
      if (log) {
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: { status: "IGNORED" },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ status: "accepted", eventId });
  } catch (err) {
    logger.error("EasyOrders webhook error", { metadata: { eventId, error: String(err) } });
    if (log) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { status: "FAILED", errorMessage: String(err) },
      }).catch(() => {});
    }
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function resolveStoreId(rawStoreId: string): Promise<string | null> {
  if (!rawStoreId) {
    // Fallback: get the first store (single-tenant deployments)
    const store = await prisma.store.findFirst({ select: { id: true } });
    return store?.id ?? null;
  }
  const store = await prisma.store.findFirst({
    where: { id: rawStoreId },
    select: { id: true },
  });
  return store?.id ?? null;
}
