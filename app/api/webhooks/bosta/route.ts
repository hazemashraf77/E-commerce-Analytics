/**
 * POST /api/webhooks/bosta
 *
 * Receives shipment lifecycle events from Bosta.
 * Bosta sends a callback when shipment state changes.
 *
 * Register this URL in Bosta:
 *   Bosta Dashboard → Settings → Webhooks / Callbacks
 *   URL: https://yourdomain.vercel.app/api/webhooks/bosta
 *   Events: All shipment events
 *
 * Security: validates X-Bosta-Signature header (HMAC-SHA256 with BOSTA_WEBHOOK_SECRET)
 * Bosta also sometimes uses X-Hub-Signature-256 format.
 */

import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { syncSingleShipment } from "@/services/sync.service";

const logger = createLogger("WebhookBosta");

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const rawBody = await request.text();

  // ── Signature verification ─────────────────────────────────────────────
  const signature = request.headers.get("x-bosta-signature") ??
                    request.headers.get("x-hub-signature-256") ??
                    request.headers.get("x-webhook-signature") ?? "";

  if (env.BOSTA_WEBHOOK_SECRET && signature) {
    const expected = "sha256=" + createHmac("sha256", env.BOSTA_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");

    try {
      const valid = expectedBuf.length === signatureBuf.length &&
        timingSafeEqual(expectedBuf, signatureBuf);
      if (!valid) {
        logger.warn("Bosta webhook signature invalid", { metadata: { signature: signature.slice(0, 30) } });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Bosta webhook payload structure:
  // { event: "DELIVERY_STATUS_CHANGED", data: { _id, trackingNumber, state, businessReference, ... } }
  const eventType      = (payload.event ?? payload.type ?? "unknown") as string;
  const eventId        = (payload.eventId ?? payload.id ?? crypto.randomUUID()) as string;
  const data           = (payload.data ?? payload) as Record<string, unknown>;
  const trackingNumber = (data.trackingNumber ?? data.tracking_number ?? data._id ?? "") as string;
  const state          = data.state ?? data.status;

  logger.info("Bosta webhook received", { metadata: { eventType, eventId, trackingNumber, state } });

  // ── Idempotency ───────────────────────────────────────────────────────
  const dedupeKey = eventId !== "unknown" ? eventId : `bosta:${trackingNumber}:${state}:${Date.now()}`;
  const existing = await prisma.webhookLog.findUnique({
    where: { provider_externalId: { provider: "BOSTA", externalId: dedupeKey } },
  }).catch(() => null);

  if (existing && eventId !== "unknown") {
    logger.info("Bosta webhook duplicate — ignoring", { metadata: { dedupeKey } });
    return NextResponse.json({ status: "duplicate" });
  }

  // ── Log event ─────────────────────────────────────────────────────────
  const log = await prisma.webhookLog.create({
    data: {
      provider:   "BOSTA",
      eventType,
      externalId: dedupeKey,
      payload:    payload as any,
      status:     "RECEIVED",
    },
  }).catch(() => null);

  // ── Process event ─────────────────────────────────────────────────────
  try {
    const store = await prisma.store.findFirst({ select: { id: true } });
    if (!store) {
      return NextResponse.json({ status: "ignored", reason: "store_not_found" });
    }

    if (!trackingNumber) {
      if (log) await prisma.webhookLog.update({ where: { id: log.id }, data: { status: "IGNORED" } }).catch(() => {});
      return NextResponse.json({ status: "ignored", reason: "no_tracking_number" });
    }

    // Process async — respond immediately
    setImmediate(async () => {
      try {
        await syncSingleShipment(store.id, trackingNumber);
        if (log) {
          await prisma.webhookLog.update({
            where: { id: log.id },
            data: { status: "PROCESSED", processedAt: new Date() },
          }).catch(() => {});
        }
      } catch (err) {
        logger.error("Bosta webhook processing failed", {
          metadata: { trackingNumber, error: String(err) },
        });
        if (log) {
          await prisma.webhookLog.update({
            where: { id: log.id },
            data: { status: "FAILED", errorMessage: String(err) },
          }).catch(() => {});
        }
      }
    });

    return NextResponse.json({ status: "accepted", trackingNumber });
  } catch (err) {
    logger.error("Bosta webhook error", { metadata: { error: String(err) } });
    if (log) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { status: "FAILED", errorMessage: String(err) },
      }).catch(() => {});
    }
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
