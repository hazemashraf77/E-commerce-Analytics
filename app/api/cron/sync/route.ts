/**
 * GET /api/cron/sync
 * Scheduled incremental sync — runs automatically via Vercel Cron.
 *
 * Vercel Cron config in vercel.json:
 * {
 *   "crons": [
*     { "path": "/api/cron/sync", "schedule": "every 15 minutes" } *   ]
 * }
 *
 * Security: validates Authorization header matches CRON_SECRET.
 * Vercel automatically sends: Authorization: Bearer <CRON_SECRET>
 */
import { type NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { runSync } from "@/services/sync.service";
import { prisma } from "@/lib/db/prisma";

const logger = createLogger("CronSync");

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max (Vercel Pro limit)

export async function GET(request: NextRequest) {
  const env = getServerEnv();

  // Validate cron secret
  const authHeader = request.headers.get("authorization");
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    logger.warn("Cron sync: unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.info("Scheduled sync starting");

  try {
    // Get all active stores
    const stores = await prisma.store.findMany({
  where: { status: "ACTIVE" },
  select: { id: true, name: true },
});

if (stores.length === 0) {
  logger.info("No active stores to sync");
  return NextResponse.json({ status: "no_stores" });
}

    const allResults = [];

    for (const store of stores) {
      logger.info("Syncing store", { metadata: { storeId: store.id, storeName: store.name } });
      const results = await runSync({
        storeId: store.id,
        fullSync: false,
        triggeredBy: "SCHEDULER",
      });
      allResults.push({ storeId: store.id, results });
    }

    const summary = {
      stores: stores.length,
      completed: allResults.flatMap(s => s.results).filter(r => r.status === "completed").length,
      failed:    allResults.flatMap(s => s.results).filter(r => r.status === "failed").length,
      skipped:   allResults.flatMap(s => s.results).filter(r => r.status === "skipped").length,
    };

    logger.info("Scheduled sync complete", { metadata: summary });
    return NextResponse.json({ status: "ok", ...summary });
  } catch (err) {
    logger.error("Scheduled sync error", { metadata: { error: String(err) } });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
