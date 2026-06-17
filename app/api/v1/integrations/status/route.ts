/**
 * GET /api/v1/integrations/status?storeId=
 * Returns current integration status for all providers.
 * Used by the homepage source status badges.
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { isIntegrationEnabled } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

type ProviderStatus = "connected" | "disconnected" | "error" | "degraded";

async function handler(request: NextRequest, auth: AuthContext) {
  const storeId = request.nextUrl.searchParams.get("storeId");
  if (!storeId || !StoreIdSchema.safeParse(storeId).success) {
    return validationError("storeId required");
  }

  // Get last sync states from DB
  const [syncStates, recentJobs] = await Promise.all([
    prisma.syncState.findMany({ where: { storeId } }).catch(() => []),
    prisma.syncJob.findMany({
      where: { storeId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { provider: true, status: true, completedAt: true, errorMessage: true },
    }).catch(() => []),
  ]);

  const stateMap = new Map(syncStates.map(s => [`${s.provider}:${s.scope}`, s]));
  const jobMap = new Map<string, typeof recentJobs[0]>();
  for (const job of recentJobs) {
    if (!jobMap.has(job.provider)) jobMap.set(job.provider, job);
  }

  function getStatus(provider: string): ProviderStatus {
    if (!isIntegrationEnabled(provider as any)) return "disconnected";
    const job = jobMap.get(provider);
    if (!job) return "connected"; // configured but never synced
    if (job.status === "FAILED") return "error";
    if (job.status === "RUNNING") return "connected";
    return "connected";
  }

  function getLastSync(provider: string): string | null {
    const state = stateMap.get(`${provider}:orders`) ??
                  stateMap.get(`${provider}:shipments`);
    return state?.lastSyncAt?.toISOString() ?? null;
  }

  const statuses = {
    EAZY_ORDER: {
      status:        getStatus("EAZY_ORDER"),
      configured:    isIntegrationEnabled("EAZY_ORDER"),
      lastSyncAt:    getLastSync("EAZY_ORDER"),
      lastJobStatus: jobMap.get("EAZY_ORDER")?.status ?? null,
      syncState:     stateMap.get("EAZY_ORDER:orders")?.status ?? "IDLE",
    },
    BOSTA: {
      status:        getStatus("BOSTA"),
      configured:    isIntegrationEnabled("BOSTA"),
      lastSyncAt:    getLastSync("BOSTA"),
      lastJobStatus: jobMap.get("BOSTA")?.status ?? null,
      syncState:     stateMap.get("BOSTA:shipments")?.status ?? "IDLE",
    },
    META: {
      status:     isIntegrationEnabled("META") ? "connected" : "disconnected" as ProviderStatus,
      configured: isIntegrationEnabled("META"),
      lastSyncAt: null,
    },
    TIKTOK: {
      status:     isIntegrationEnabled("TIKTOK") ? "connected" : "disconnected" as ProviderStatus,
      configured: isIntegrationEnabled("TIKTOK"),
      lastSyncAt: null,
    },
  };

  return ok(statuses, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
