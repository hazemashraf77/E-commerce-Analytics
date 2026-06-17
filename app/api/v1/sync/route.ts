/**
 * POST /api/v1/sync
 * Manual sync trigger — wired to the "Sync Now" button on the homepage.
 *
 * Body: { storeId, fullSync?, providers? }
 * Auth: MANAGER minimum
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { runSync } from "@/services/sync.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("SyncAPI");

const Schema = z.object({
  storeId:   StoreIdSchema,
  fullSync:  z.boolean().default(false),
  providers: z.array(z.enum(["EAZY_ORDER", "BOSTA"])).optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return validationError("Request body must be valid JSON"); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError("Invalid sync request", { issues: parsed.error.issues });

  const { storeId, fullSync, providers } = parsed.data;

  logger.info("Manual sync triggered", {
    metadata: { storeId, fullSync, providers, userId: auth.userId },
  });

  const results = await runSync({
    storeId,
    fullSync,
    providers,
    triggeredBy: "MANUAL",
  });

  const summary = {
    totalProcessed: results.reduce((s, r) => s + r.recordsProcessed, 0),
    totalFailed:    results.reduce((s, r) => s + r.recordsFailed, 0),
    providers: results.map(r => ({
      provider:  r.provider,
      scope:     r.scope,
      status:    r.status,
      processed: r.recordsProcessed,
      failed:    r.recordsFailed,
      duration:  `${r.durationMs}ms`,
    })),
  };

  return ok(summary, { requestId: auth.requestId });
}

export const POST = withAuth(handler, "MANAGER");

/**
 * GET /api/v1/sync — returns last sync status per provider
 */
async function getHandler(request: NextRequest, auth: AuthContext) {
  const storeId = request.nextUrl.searchParams.get("storeId");
  if (!storeId || !StoreIdSchema.safeParse(storeId).success) {
    return validationError("storeId required");
  }

  const { prisma } = await import("@/lib/db/prisma");

  const [syncStates, recentJobs] = await Promise.all([
    prisma.syncState.findMany({ where: { storeId } }).catch(() => []),
    prisma.syncJob.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, provider: true, status: true, startedAt: true, completedAt: true, recordsSynced: true, recordsFailed: true, errorMessage: true, createdAt: true },
    }).catch(() => []),
  ]);

  return ok({ syncStates, recentJobs }, { requestId: auth.requestId });
}

export const GET = withAuth(getHandler, "READ_ONLY");
