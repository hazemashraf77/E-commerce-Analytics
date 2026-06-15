/**
 * Sync history entity and repository.
 * Repository: 073_API_INTEGRATION_BIBLE.md — AUDIT, Sync History
 *
 * "Every synchronization stores: Started By, Started At, Finished At,
 *  Imported Records, Changed Records, Failed Records, Warnings,
 *  Provider Version, Checksum." (073)
 * "Audit History remains immutable." (073)
 */

export type SyncOutcome = "SUCCESS" | "PARTIAL" | "FAILED" | "SKIPPED";

export interface SyncHistoryRecord {
  id: string;
  storeId: string;
  provider: string;
  scope: string;
  outcome: SyncOutcome;
  startedBy: string;                // "SCHEDULER" | "MANUAL" | "WEBHOOK"
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  recordsImported: number;
  recordsChanged: number;
  recordsFailed: number;
  warnings: string[];
  errors: string[];
  providerVersion?: string;
  syncBatchId: string;
  checksum?: string;
  isPreviewMode: boolean;           // true when using mock data
}

/**
 * In-memory sync history store (preview mode).
 * Production: replaced by Prisma SyncJob table write.
 */
const syncHistoryStore: SyncHistoryRecord[] = [];

export function recordSyncStart(params: {
  storeId: string;
  provider: string;
  scope: string;
  startedBy: string;
  isPreviewMode?: boolean;
}): SyncHistoryRecord {
  const record: SyncHistoryRecord = {
    id: crypto.randomUUID(),
    storeId: params.storeId,
    provider: params.provider,
    scope: params.scope,
    outcome: "SUCCESS",
    startedBy: params.startedBy,
    startedAt: new Date().toISOString(),
    recordsImported: 0,
    recordsChanged: 0,
    recordsFailed: 0,
    warnings: [],
    errors: [],
    syncBatchId: crypto.randomUUID(),
    isPreviewMode: params.isPreviewMode ?? false,
  };
  syncHistoryStore.push(record);
  return record;
}

export function recordSyncEnd(
  id: string,
  result: Partial<Pick<SyncHistoryRecord, "outcome" | "recordsImported" | "recordsChanged" | "recordsFailed" | "warnings" | "errors" | "providerVersion" | "checksum">>,
): SyncHistoryRecord | undefined {
  const record = syncHistoryStore.find((r) => r.id === id);
  if (!record) return undefined;

  const finishedAt = new Date().toISOString();
  const durationMs = new Date(finishedAt).getTime() - new Date(record.startedAt).getTime();

  Object.assign(record, { ...result, finishedAt, durationMs });
  return record;
}

export function getSyncHistory(
  storeId: string,
  provider?: string,
  limit = 50,
): SyncHistoryRecord[] {
  return syncHistoryStore
    .filter((r) => r.storeId === storeId && (!provider || r.provider === provider))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}
