/**
 * Sync Orchestrator Service — Sprint 1 (repaired)
 *
 * Fixed:
 * - Removed unused getServerEnv import
 * - Provider isolation: one failure never stops others
 * - Structured logging at each step
 * - ACTIVE_SYNCS lock prevents duplicate concurrent runs
 */

import { createLogger } from "@/lib/logger";
import { syncEasyOrders } from "./sync-easyorders.service";
import { syncBosta } from "./sync-bosta.service";
import { syncMetaAds } from "./sync-meta.service";
import { syncTikTokAds } from "./sync-tiktok.service";
import { writeSyncLog } from "./sync-log.service";

const logger = createLogger("SyncOrchestrator");

export type SyncProviderKey = "EASYORDERS" | "BOSTA" | "META" | "TIKTOK";

export type ProviderSyncStatus =
  | "success"
  | "failed"
  | "skipped_missing_credentials"
  | "skipped_already_running";

export interface ProviderSyncResult {
  provider: SyncProviderKey;
  status: ProviderSyncStatus;
  recordsFetched: number;
  recordsUpserted: number;
  durationMs: number;
  errorMessage?: string;
}

export interface OrchestratorResult {
  mode: string;
  startedAt: string;
  finishedAt: string;
  providers: ProviderSyncResult[];
}

// Module-level lock — prevents concurrent syncs for the same provider
const ACTIVE_SYNCS = new Set<SyncProviderKey>();

const VALID_PROVIDERS = new Set<SyncProviderKey>(["EASYORDERS", "BOSTA", "META", "TIKTOK"]);

export async function syncOrchestrator(options: {
  providers: string[];
  mode: string;
}): Promise<OrchestratorResult> {
  const { mode } = options;
  const startedAt = new Date().toISOString();

  // Normalise and validate provider list
  const providers = options.providers
    .map(p => p.toUpperCase() as SyncProviderKey)
    .filter(p => VALID_PROVIDERS.has(p));

  logger.info("SyncOrchestrator started", { metadata: { providers, mode } });

  const results: ProviderSyncResult[] = [];

  for (const provider of providers) {
    // Lock check
    if (ACTIVE_SYNCS.has(provider)) {
      logger.warn(`${provider} sync skipped — already running`);
      results.push({
        provider,
        status: "skipped_already_running",
        recordsFetched: 0,
        recordsUpserted: 0,
        durationMs: 0,
      });
      continue;
    }

    ACTIVE_SYNCS.add(provider);
    const t0 = Date.now();

    try {
      let partial: Omit<ProviderSyncResult, "provider" | "durationMs">;

      logger.info(`${provider} sync started`);

      switch (provider) {
        case "EASYORDERS":
          partial = await syncEasyOrders(mode);
          break;
        case "BOSTA":
          partial = await syncBosta(mode);
          break;
        case "META":
          partial = await syncMetaAds(mode);
          break;
        case "TIKTOK":
          partial = await syncTikTokAds(mode);
          break;
        default:
          // TypeScript exhaustiveness — VALID_PROVIDERS filter above prevents this path
          partial = { status: "skipped_missing_credentials", recordsFetched: 0, recordsUpserted: 0, errorMessage: `Unknown provider: ${provider as string}` };
      }

      const durationMs = Date.now() - t0;
      logger.info(`${provider} sync ${partial.status}`, {
        metadata: { recordsFetched: partial.recordsFetched, recordsUpserted: partial.recordsUpserted, durationMs },
      });

      const result: ProviderSyncResult = { provider, ...partial, durationMs };
      results.push(result);

      // Write audit log (non-blocking)
      void writeSyncLog({
        provider,
        status: partial.status === "success" ? "SUCCESS"
          : partial.status.startsWith("skipped") ? "SKIPPED"
          : "FAILED",
        startedAt: new Date(t0),
        finishedAt: new Date(),
        recordsFetched: partial.recordsFetched,
        recordsUpserted: partial.recordsUpserted,
        errorMessage: partial.errorMessage,
        mode,
      }).catch(() => {}); // log write never blocks sync

    } catch (err) {
      // Unexpected error — isolate, never propagate
      const durationMs = Date.now() - t0;
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`${provider} sync threw unexpected error`, { metadata: { errorMessage } });

      results.push({
        provider,
        status: "failed",
        recordsFetched: 0,
        recordsUpserted: 0,
        durationMs,
        errorMessage,
      });

      void writeSyncLog({
        provider,
        status: "FAILED",
        startedAt: new Date(t0),
        finishedAt: new Date(),
        recordsFetched: 0,
        recordsUpserted: 0,
        errorMessage,
        mode,
      }).catch(() => {});
    } finally {
      ACTIVE_SYNCS.delete(provider);
    }
  }

  const finishedAt = new Date().toISOString();
  logger.info("SyncOrchestrator finished", {
    metadata: results.map(r => `${r.provider}:${r.status}:upserted=${r.recordsUpserted}`),
  });

  return { mode, startedAt, finishedAt, providers: results };
}
