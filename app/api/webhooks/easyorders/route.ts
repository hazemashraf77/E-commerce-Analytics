/**
 * POST /api/webhooks/easyorders
 *
 * Receives Order and Order Status Update events from EasyOrders.
 * EasyOrders issues TWO different webhook secrets — one per event type.
 *
 * Register in EasyOrders dashboard:
 *   Order webhook:
 *     URL:    https://yourdomain.vercel.app/api/webhooks/easyorders
 *     Secret: <EASYORDERS_ORDER_WEBHOOK_SECRET>
 *   Order Status Update webhook:
 *     URL:    https://yourdomain.vercel.app/api/webhooks/easyorders
 *     Secret: <EASYORDERS_ORDER_STATUS_WEBHOOK_SECRET>
 *
 * Processing order:
 *   1. Read raw body
 *   2. Parse JSON to detect event type
 *   3. Verify EasyOrders shared secret from request header
 *   4. Delegate to EasyOrdersWebhookService
 *   5. Return HTTP response
 *
 * No business logic here. Route stays thin.
 */

import { type NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import {
  handleEasyOrdersWebhook,
  detectEventType,
} from "@/services/webhook-easyorders.service";

const logger = createLogger("WebhookEasyOrders");

export const runtime     = "nodejs"; // required for crypto
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body ─────────────────────────────────────────────────────
  // Must read before any JSON parse — HMAC is computed over raw bytes.
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  if (!rawBody.trim()) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  // ── 2. Parse JSON to detect event type ───────────────────────────────────
  // Event type must be known before we can pick the correct secret.
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    logger.warn("EasyOrders webhook: invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload !== "object" || Array.isArray(payload) || payload === null) {
    return NextResponse.json({ error: "Payload must be a JSON object" }, { status: 400 });
  }

  const eventType = detectEventType(payload);

  // ── 3. Verify EasyOrders shared secret ────────────────────
  // Order events         → EASYORDERS_ORDER_WEBHOOK_SECRET
  // Status update events → EASYORDERS_ORDER_STATUS_WEBHOOK_SECRET
  const env = getServerEnv();

 const possibleSecrets = [
  env.EASYORDERS_ORDER_WEBHOOK_SECRET,
  env.EASYORDERS_ORDER_STATUS_WEBHOOK_SECRET,
].filter(Boolean) as string[];

if (possibleSecrets.length > 0) {
  const receivedSecret = (
    request.headers.get("secret") ??
    request.headers.get("x-webhook-secret") ??
    request.headers.get("webhook-secret") ??
    ""
  ).trim();

  if (!receivedSecret) {
    const headerNames: string[] = [];
    request.headers.forEach((_value, key) => headerNames.push(key));

    logger.warn("EasyOrders webhook: missing secret header", {
      metadata: { eventType, headerNames },
    });

    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 401 },
    );
  }

  logger.info("EasyOrders webhook: secret received", {
    metadata: {
      eventType,
      secretPrefix: receivedSecret.substring(0, 12),
      secretLength: receivedSecret.length,
    },
  });

  const receivedBuffer = Buffer.from(receivedSecret, "utf8");

  const valid = possibleSecrets.some((candidate) => {
    const expectedBuffer = Buffer.from(candidate, "utf8");

    return (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  });

  if (!valid) {
    logger.warn("EasyOrders webhook: invalid secret", {
      metadata: {
        eventType,
        secretPrefix: receivedSecret.substring(0, 12),
      },
    });

    return NextResponse.json(
      { error: "Invalid webhook secret" },
      { status: 401 },
    );
  }
} else {
  logger.warn("EasyOrders webhook: no webhook secrets configured; verification skipped", {
    metadata: {
      eventType,
      expectedEnvVars: [
        "EASYORDERS_ORDER_WEBHOOK_SECRET",
        "EASYORDERS_ORDER_STATUS_WEBHOOK_SECRET",
      ],
    },
  });
}

  // ── 4. Collect safe headers ───────────────────────────────────────────────
  const rawHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => { rawHeaders[key.toLowerCase()] = value; });

  // ── 5. Delegate to service layer ──────────────────────────────────────────
  try {
    const result = await handleEasyOrdersWebhook(payload, rawHeaders, eventType);

    switch (result.outcome) {
      case "processed":
        return NextResponse.json({
          status: "accepted",
          outcome: "processed",
          eventType: result.eventType,
          externalId: result.externalId,
          orderId: result.orderId,
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
    logger.error("EasyOrders webhook: unexpected error", { metadata: { error: message } });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
