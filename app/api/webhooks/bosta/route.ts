/**
 * POST /api/webhooks/bosta
 *
 * Receives shipment lifecycle events from Bosta.
 *
 * Register this URL in Bosta:
 *   Dashboard → Settings → Webhooks / Callbacks
 *   URL:    https://yourdomain.vercel.app/api/webhooks/bosta
 *   Events: All (DELIVERY_STATUS_CHANGED and any other events)
 *   Secret: set BOSTA_WEBHOOK_SECRET and paste the same value in Bosta dashboard
 *
 * Security:
 *   Verifies X-Bosta-Signature or X-Hub-Signature-256 header (HMAC-SHA256, sha256=<hex>).
 *   If BOSTA_WEBHOOK_SECRET is unset, signature check is skipped.
 *
 * This route is intentionally thin:
 *   1. Read raw body
 *   2. Verify signature
 *   3. Parse JSON
 *   4. Delegate to BostaWebhookService
 *   5. Return HTTP response
 *
 * No business logic here.
 */

import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { handleBostaWebhook } from "@/services/webhook-bosta.service";

const logger = createLogger("WebhookBosta");

export const runtime     = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body ─────────────────────────────────────────────────────
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // ── 2. Signature verification ────────────────────────────────────────────
  const env = getServerEnv();

  if (env.BOSTA_WEBHOOK_SECRET) {
    const directSecret = (
  request.headers.get("secret") ??
  request.headers.get("x-webhook-secret") ??
  request.headers.get("webhook-secret") ??
  ""
).trim();

if (directSecret) {
  const expected = Buffer.from(env.BOSTA_WEBHOOK_SECRET, "utf8");
  const received = Buffer.from(directSecret, "utf8");

  const valid =
    expected.length === received.length &&
    timingSafeEqual(expected, received);

  if (!valid) {
    logger.warn("Bosta webhook: invalid direct secret", {
      metadata: { secretPrefix: directSecret.slice(0, 8) },
    });
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
} else {
  const signature = (
    request.headers.get("x-bosta-signature") ??
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("signature") ??
    request.headers.get("authorization") ??
    ""
  ).trim();

  if (!signature) {
    const headerNames: string[] = [];
    request.headers.forEach((_value, key) => headerNames.push(key));

    logger.warn("Bosta webhook: missing signature/secret header", {
      metadata: { headerNames },
    });

    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const hmacHex = createHmac("sha256", env.BOSTA_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");

  const expected = `sha256=${hmacHex}`;
  const expectedBuf = Buffer.from(expected, "utf8");
  const sigBuf = Buffer.from(signature, "utf8");

  const plainBuf = Buffer.from(hmacHex, "utf8");
  const plainSig = Buffer.from(signature.replace(/^sha256=/, ""), "utf8");

  const valid =
    (expectedBuf.length === sigBuf.length && timingSafeEqual(expectedBuf, sigBuf)) ||
    (plainBuf.length === plainSig.length && timingSafeEqual(plainBuf, plainSig));

  if (!valid) {
    logger.warn("Bosta webhook: invalid signature", {
      metadata: { sigPrefix: signature.slice(0, 15) },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
}

  // ── 3. Parse JSON ────────────────────────────────────────────────────────
  if (!rawBody.trim()) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    logger.warn("Bosta webhook: invalid JSON payload");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload !== "object" || Array.isArray(payload) || payload === null) {
    return NextResponse.json({ error: "Payload must be a JSON object" }, { status: 400 });
  }

  // ── 4. Collect safe headers for logging ──────────────────────────────────
  const rawHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    rawHeaders[key.toLowerCase()] = value;
  });

  // ── 5. Delegate to service layer ─────────────────────────────────────────
  try {
    const result = await handleBostaWebhook(payload, rawHeaders);

    switch (result.outcome) {
      case "processed":
        return NextResponse.json({
          status: "accepted",
          outcome: "processed",
          eventType: result.eventType,
          externalId: result.externalId,
          trackingNumber: result.trackingNumber,
        });

      case "duplicate":
        return NextResponse.json({
          status: "accepted",
          outcome: "duplicate",
          externalId: result.externalId,
        });

      case "ignored":
        return NextResponse.json({
          status: "accepted",
          outcome: "ignored",
          externalId: result.externalId,
        });

      case "failed":
        return NextResponse.json(
          { error: "Processing failed", details: result.errorMessage },
          { status: 500 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Bosta webhook: unexpected error in route", {
      metadata: { error: message },
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
