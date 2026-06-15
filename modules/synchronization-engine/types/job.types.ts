/**
 * Background job type definitions.
 * Repository: 031_BACKGROUND_JOBS.md — JOB STRUCTURE, JOB PRIORITIES,
 *             JOB QUEUES, JOB LIFECYCLE, RETRY POLICY
 */

import type { Provider, SyncScope } from "./adapter.types";

// ── Job identity ───────────────────────────────────────────────────────────

/** Per 031: JOB CATEGORIES */
export type JobCategory =
  | "SYNCHRONIZATION"
  | "REPORTING"
  | "ANALYTICS"
  | "AI"
  | "MAINTENANCE"
  | "NOTIFICATIONS"
  | "CLEANUP"
  | "IMPORT"
  | "EXPORT";

/** Per 031: JOB PRIORITIES */
export type JobPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

/** Per 031: JOB LIFECYCLE + 013: SYNCHRONIZATION STATE */
export type JobStatus =
  | "PENDING"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING"
  | "CANCELLED"
  | "TIMED_OUT";

// ── Per 031: JOB STRUCTURE ─────────────────────────────────────────────────

export interface JobRecord<TPayload = unknown> {
  jobId: string;
  jobType: string;
  category: JobCategory;
  status: JobStatus;
  priority: JobPriority;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  payload: TPayload;
  metadata: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
}

// ── Per 031: RETRY POLICY — documented backoff intervals ──────────────────

/** 1st: 30s, 2nd: 2min, 3rd: 10min — then dead letter */
export const RETRY_DELAYS_MS: readonly number[] = [
  30_000,    // 1st retry: 30 seconds
  120_000,   // 2nd retry: 2 minutes
  600_000,   // 3rd retry: 10 minutes
] as const;

export const MAX_JOB_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

// ── Per 031: JOB QUEUES — separate per category ───────────────────────────

export const JOB_QUEUES = {
  SYNCHRONIZATION: "queue:sync",
  REPORTING: "queue:reporting",
  ANALYTICS: "queue:analytics",
  AI: "queue:ai",
  MAINTENANCE: "queue:maintenance",
  NOTIFICATIONS: "queue:notifications",
  CLEANUP: "queue:cleanup",
} as const satisfies Record<JobCategory, string>;

// ── Specific sync job payload ──────────────────────────────────────────────

export interface SyncJobPayload {
  provider: Provider;
  scope: SyncScope;
  storeId: string;
  fullSync?: boolean;
  cursor?: string;
  since?: string;
  triggeredBy: "SCHEDULER" | "MANUAL" | "WEBHOOK" | "RECOVERY";
}

// ── Per 031: DEAD LETTER QUEUE ─────────────────────────────────────────────

export interface DeadLetterRecord {
  originalJobId: string;
  jobType: string;
  payload: unknown;
  failureReason: string;
  retryHistory: Array<{ attemptedAt: string; error: string }>;
  deadAt: string;
}
