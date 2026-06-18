/**
 * POST /api/sync/run
 *
 * Called by the "Sync Now / مزامنة الآن" button.
 * Validates request, executes real sync, returns per-provider results.
 *
 * Body (all optional — defaults shown):
 * {
 *   "providers": ["EASYORDERS", "BOSTA", "META", "TIKTOK"],
 *   "mode": "manual"
 * }
 *
 * Supports modes: manual | scheduled | background
 *
 * No auth required for preview mode — middleware already handles bypass.
 * In production the middleware enforces session.
 */
import { type NextRequest, NextResponse } from "next/server";
import { syncOrchestrator } from "@/services/sync-orchestrator.service";
import { createLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro: 60s; Hobby: 10s

const logger = createLogger("SyncRunRoute");

const VALID_PROVIDERS = new Set(["EASYORDERS", "BOSTA", "META", "TIKTOK"]);
const VALID_MODES = new Set(["manual", "scheduled", "background"]);

export async function POST(request: NextRequest) {
  // Parse body — empty body is OK, defaults apply
  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Validate providers
  const rawProviders = Array.isArray(body.providers)
    ? (body.providers as unknown[]).map(p => String(p).toUpperCase())
    : ["EASYORDERS", "BOSTA", "META", "TIKTOK"];

  const providers = rawProviders.filter(p => VALID_PROVIDERS.has(p));
  if (providers.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid providers specified. Valid: EASYORDERS, BOSTA, META, TIKTOK" },
      { status: 400 },
    );
  }

  // Validate mode
  const rawMode = String(body.mode ?? "manual").toLowerCase();
  const mode = VALID_MODES.has(rawMode) ? rawMode : "manual";

  logger.info("POST /api/sync/run", { metadata: { providers, mode } });

  try {
    const result = await syncOrchestrator({ providers, mode });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Sync run failed", { metadata: { error: message } });
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
