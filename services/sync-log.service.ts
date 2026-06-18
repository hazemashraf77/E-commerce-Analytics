/**
 * Sync Log Service — Sprint 1 (repaired)
 *
 * Fixed:
 * - SyncJob.status only uses valid SyncJobStatus enum: PENDING|RUNNING|COMPLETED|FAILED|CANCELLED
 *   (SKIPPED is NOT a valid value — mapped to CANCELLED)
 * - SyncJob fields use schema names: recordsFound, recordsSynced (not recordsFetched, recordsUpserted)
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type { SyncJobStatus } from "@prisma/client";

const logger = createLogger("SyncLog");

export interface SyncLogEntry {
  provider: string;
  status: "STARTED" | "SUCCESS" | "FAILED" | "SKIPPED";
  startedAt: Date;
  finishedAt?: Date;
  recordsFetched: number;
  recordsUpserted: number;
  errorMessage?: string;
  mode: string;
}

/** Map our internal status to valid SyncJobStatus enum values */
function toJobStatus(status: SyncLogEntry["status"]): SyncJobStatus {
  switch (status) {
    case "SUCCESS": return "COMPLETED";
    case "FAILED":  return "FAILED";
    case "STARTED": return "RUNNING";
    case "SKIPPED": return "CANCELLED"; // closest valid value for skipped
  }
}

export async function writeSyncLog(entry: SyncLogEntry): Promise<void> {
  const { provider, status, startedAt, finishedAt, recordsFetched, recordsUpserted, errorMessage, mode } = entry;

  // Always emit structured Vercel log
  const meta = {
    metadata: {
      provider, status, mode,
      recordsFetched, recordsUpserted,
      durationMs: finishedAt ? finishedAt.getTime() - startedAt.getTime() : undefined,
      errorMessage: errorMessage?.slice(0, 500),
    },
  };
  if (status === "FAILED") logger.error(`${provider} sync ${status}`, meta);
  else logger.info(`${provider} sync ${status}`, meta);

  // Write to DB — non-fatal
  try {
    const store = await prisma.store.findFirst({ select: { id: true } });
    if (!store) return;

    await prisma.syncJob.create({
      data: {
        storeId:      store.id,
        provider,
        status:       toJobStatus(status),
        startedAt,
        completedAt:  finishedAt,
        recordsFound: recordsFetched,   // correct schema field name
        recordsSynced: recordsUpserted, // correct schema field name
        recordsFailed: 0,
        errorMessage: errorMessage?.slice(0, 1000),
      },
    });
  } catch (err) {
    // Non-fatal — never block sync execution on log failure
    logger.warn("SyncLog: DB write failed", { metadata: { error: String(err) } });
  }
}
