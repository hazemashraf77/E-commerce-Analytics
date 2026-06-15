/**
 * Synchronization Engine — main orchestrator.
 * Repository: 013_SYNCHRONIZATION_ENGINE.md — SYNCHRONIZATION PIPELINE,
 *             EXECUTION DEPENDENCIES, SYNCHRONIZATION LOCKING,
 *             PARALLEL PROCESSING
 *
 * Pipeline: Provider → Auth → Download → Validation → Normalization
 *         → Canonical Conversion → Duplicate Detection → DB Update
 *         → Business Engine Trigger (deferred to engine sprints)
 *
 * Rules:
 *  • "The Synchronization Engine never performs business calculations." (013)
 *  • "Business Engines execute after synchronization completes." (013)
 *  • LOCKING: prevent duplicate jobs for same provider+scope (013)
 */

import { createLogger } from "@/lib/logger";
import type { Provider, SyncScope, IOrderAdapter, IShippingAdapter, IMarketingAdapter } from "../types/adapter.types";
import type { SyncJobPayload } from "../types/job.types";
import { completeJob, failJob } from "../queue/job.queue";

const logger = createLogger("SynchronizationEngine");

// ── Sync lock — prevent duplicate concurrent jobs (013: LOCKING) ───────────
const activeLocks = new Set<string>();

function lockKey(provider: Provider, scope: SyncScope, storeId: string): string {
  return `${provider}:${scope}:${storeId}`;
}

// ── Adapter registry ───────────────────────────────────────────────────────

type AnyAdapter = IOrderAdapter | IShippingAdapter | IMarketingAdapter;

const adapterRegistry = new Map<string, AnyAdapter>();

export function registerAdapter(adapter: AnyAdapter): void {
  const key = `${adapter.provider}:${adapter.storeId}`;
  adapterRegistry.set(key, adapter);
  logger.info("Adapter registered", {
    metadata: { provider: adapter.provider, storeId: adapter.storeId },
  });
}

function getAdapter(provider: Provider, storeId: string): AnyAdapter | null {
  return adapterRegistry.get(`${provider}:${storeId}`) ?? null;
}

// ── Main execution ─────────────────────────────────────────────────────────

export interface SyncExecutionResult {
  jobId: string;
  provider: Provider;
  scope: SyncScope;
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  durationMs: number;
}

export async function executeSync(
  jobId: string,
  payload: SyncJobPayload,
): Promise<SyncExecutionResult> {
  const { provider, scope, storeId, fullSync, cursor, since } = payload;
  const lock = lockKey(provider, scope, storeId);
  const startMs = Date.now();

  // Locking check (013: SYNCHRONIZATION LOCKING)
  if (activeLocks.has(lock)) {
    const msg = `Sync already running for ${provider}:${scope}:${storeId} — skipping`;
    logger.warn(msg, { metadata: { jobId } });
    failJob(jobId, msg);
    return {
      jobId,
      provider,
      scope,
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: [msg],
      durationMs: Date.now() - startMs,
    };
  }

  activeLocks.add(lock);
  logger.info("Sync execution started", {
    metadata: { jobId, provider, scope, storeId, fullSync },
  });

  let recordsProcessed = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  try {
    const adapter = getAdapter(provider, storeId);
    if (!adapter) {
      throw new Error(`No adapter registered for provider=${provider} storeId=${storeId}`);
    }

    const fetchOptions = { since, cursor, fullSync };

    // Execute appropriate fetch based on scope + adapter type
    // Per 013: EXECUTION DEPENDENCIES order
    if (scope === "ORDERS" && "fetchOrders" in adapter) {
      const result = await (adapter as IOrderAdapter).fetchOrders(fetchOptions);
      recordsProcessed = result.records.length;
      recordsFailed = result.errors.length;
      errors.push(...result.errors.map((e) => `[${e.type}] ${e.message}`));
      logger.info("Orders synced", {
        metadata: { jobId, recordsProcessed, recordsFailed },
      });
    } else if (scope === "SHIPMENTS" && "fetchShipments" in adapter) {
      const result = await (adapter as IShippingAdapter).fetchShipments(fetchOptions);
      recordsProcessed = result.records.length;
      recordsFailed = result.errors.length;
      errors.push(...result.errors.map((e) => `[${e.type}] ${e.message}`));
    } else if (scope === "SETTLEMENTS" && "fetchSettlements" in adapter) {
      const result = await (adapter as IShippingAdapter).fetchSettlements(fetchOptions);
      recordsProcessed = result.records.length;
      recordsFailed = result.errors.length;
    } else if (scope === "MARKETING") {
      if ("fetchCampaigns" in adapter) {
        const cr = await (adapter as IMarketingAdapter).fetchCampaigns(fetchOptions);
        const sr = await (adapter as IMarketingAdapter).fetchSpend(fetchOptions);
        recordsProcessed = cr.records.length + sr.records.length;
        recordsFailed = cr.errors.length + sr.errors.length;
      }
    } else {
      throw new Error(`Scope ${scope} not supported by adapter ${provider}`);
    }

    completeJob(jobId);
    logger.info("Sync execution completed", {
      metadata: { jobId, provider, scope, recordsProcessed, durationMs: Date.now() - startMs },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    errors.push(message);
    recordsFailed += 1;
    failJob(jobId, message, stack);
    logger.error("Sync execution failed", {
      metadata: { jobId, provider, scope, message },
    });
  } finally {
    activeLocks.delete(lock);
  }

  return {
    jobId,
    provider,
    scope,
    recordsProcessed,
    recordsFailed,
    errors,
    durationMs: Date.now() - startMs,
  };
}

/** Health summary per 013: PROVIDER HEALTH */
export function getProviderHealth(): Record<string, { registered: boolean }> {
  const health: Record<string, { registered: boolean }> = {};
  for (const key of adapterRegistry.keys()) {
    health[key] = { registered: true };
  }
  return health;
}
