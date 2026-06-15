/**
 * Synchronization scheduler.
 * Repository: 013_SYNCHRONIZATION_ENGINE.md — SCHEDULED SYNCHRONIZATION
 *   Orders: every 10 min, Shipments: every 10 min,
 *   Marketing: every 60 min, Settlements: every 60 min.
 *   "Schedules remain configurable."
 *
 * Uses setInterval for the scaffold; production replaces with
 * pg-cron / BullMQ / Inngest in the infrastructure sprint.
 */

import type { Provider, SyncScope } from "../types/adapter.types";
import type { SyncJobPayload } from "../types/job.types";
import { enqueueSyncJob } from "../queue/job.queue";
import { createLogger } from "@/lib/logger";

const logger = createLogger("SyncScheduler");

// ── Documented frequencies (013: SCHEDULED SYNCHRONIZATION) ───────────────
// All values in milliseconds. Remain configurable per repository rule.

const DEFAULT_INTERVALS_MS: Record<SyncScope, number> = {
  ORDERS: 10 * 60 * 1_000,       // 10 minutes
  SHIPMENTS: 10 * 60 * 1_000,    // 10 minutes
  SETTLEMENTS: 60 * 60 * 1_000,  // 60 minutes
  MARKETING: 60 * 60 * 1_000,    // 60 minutes
};

export interface SchedulerConfig {
  provider: Provider;
  storeId: string;
  scopes: SyncScope[];
  /** Override defaults; still defaults to documented values when not set */
  intervalOverrides?: Partial<Record<SyncScope, number>>;
}

type Handle = ReturnType<typeof setInterval>;

export class SyncScheduler {
  private readonly handles = new Map<string, Handle>();
  private readonly config: SchedulerConfig;

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  /** Start scheduled sync for all configured scopes */
  start(): void {
    const { provider, storeId, scopes, intervalOverrides } = this.config;

    for (const scope of scopes) {
      const key = `${provider}:${scope}`;
      if (this.handles.has(key)) continue;

      const intervalMs =
        intervalOverrides?.[scope] ?? DEFAULT_INTERVALS_MS[scope];

      const payload: SyncJobPayload = {
        provider,
        scope,
        storeId,
        triggeredBy: "SCHEDULER",
      };

      logger.info(`Scheduler started`, {
        metadata: { provider, scope, intervalMs },
      });

      const handle = setInterval(() => {
        enqueueSyncJob(payload);
        logger.debug(`Sync job enqueued by scheduler`, {
          metadata: { provider, scope },
        });
      }, intervalMs);

      this.handles.set(key, handle);
    }
  }

  /** Stop all scheduled jobs for this scheduler instance */
  stop(): void {
    for (const [key, handle] of this.handles.entries()) {
      clearInterval(handle);
      logger.info(`Scheduler stopped`, { metadata: { key } });
    }
    this.handles.clear();
  }

  /** Trigger a manual sync for a specific scope (013: MANUAL SYNCHRONIZATION) */
  triggerManual(scope: SyncScope, fullSync = false): void {
    const payload: SyncJobPayload = {
      provider: this.config.provider,
      scope,
      storeId: this.config.storeId,
      fullSync,
      triggeredBy: "MANUAL",
    };
    enqueueSyncJob(payload);
    logger.info(`Manual sync triggered`, {
      metadata: { provider: this.config.provider, scope, fullSync },
    });
  }

  get activeScopes(): string[] {
    return [...this.handles.keys()];
  }
}
