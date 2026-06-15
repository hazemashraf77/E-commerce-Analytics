/**
 * In-memory job queue.
 * Repository: 031_BACKGROUND_JOBS.md — JOB QUEUES, RETRY POLICY,
 *             DEAD LETTER QUEUE, CONCURRENCY, JOB LIFECYCLE
 *
 * Production note: replace the in-memory store with Redis/pg-boss
 * in the infrastructure sprint. The interface contract is stable.
 */

import type {
  JobRecord,
  JobStatus,
  JobPriority,
  JobCategory,
  DeadLetterRecord,
  SyncJobPayload,
} from "../types/job.types";
import { RETRY_DELAYS_MS, MAX_JOB_ATTEMPTS, JOB_QUEUES } from "../types/job.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("JobQueue");

// ── Priority sort order (CRITICAL=0, HIGH=1, NORMAL=2, LOW=3) ─────────────
const PRIORITY_ORDER: Record<JobPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

// ── Queue store ────────────────────────────────────────────────────────────

const queues = new Map<string, JobRecord[]>();
const deadLetterQueue: DeadLetterRecord[] = [];
const retryHistory = new Map<string, Array<{ attemptedAt: string; error: string }>>();

function getQueue(queueName: string): JobRecord[] {
  if (!queues.has(queueName)) queues.set(queueName, []);
  return queues.get(queueName)!;
}

function sortByPriority(jobs: JobRecord[]): void {
  jobs.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

// ── Enqueue ────────────────────────────────────────────────────────────────

export function enqueue<TPayload>(options: {
  jobType: string;
  category: JobCategory;
  priority: JobPriority;
  payload: TPayload;
  metadata?: Record<string, unknown>;
}): JobRecord<TPayload> {
  const queueName = JOB_QUEUES[options.category] ?? `queue:${options.category.toLowerCase()}`;
  const queue = getQueue(queueName);

  const job: JobRecord<TPayload> = {
    jobId: crypto.randomUUID(),
    jobType: options.jobType,
    category: options.category,
    status: "QUEUED",
    priority: options.priority,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: MAX_JOB_ATTEMPTS,
    payload: options.payload,
    metadata: options.metadata ?? {},
  };

  queue.push(job);
  sortByPriority(queue);

  logger.info(`Job enqueued`, {
    metadata: { jobId: job.jobId, jobType: job.jobType, queue: queueName },
  });

  return job;
}

// ── Dequeue ────────────────────────────────────────────────────────────────

export function dequeue(category: JobCategory): JobRecord | null {
  const queueName = JOB_QUEUES[category] ?? `queue:${category.toLowerCase()}`;
  const queue = getQueue(queueName);
  const now = new Date();

  // Find first QUEUED job whose nextRetryAt has passed
  const idx = queue.findIndex(
    (j) =>
      (j.status === "QUEUED" || j.status === "RETRYING") &&
      (!j.nextRetryAt || new Date(j.nextRetryAt) <= now),
  );

  if (idx === -1) return null;
  const [job] = queue.splice(idx, 1);
  job.status = "RUNNING";
  job.startedAt = now.toISOString();
  job.attempts += 1;
  queue.push(job); // keep in queue while running (for observability)
  return job;
}

// ── Complete / fail ────────────────────────────────────────────────────────

export function completeJob(jobId: string): void {
  for (const queue of queues.values()) {
    const job = queue.find((j) => j.jobId === jobId);
    if (job) {
      job.status = "COMPLETED";
      job.completedAt = new Date().toISOString();
      logger.info("Job completed", { metadata: { jobId } });
      return;
    }
  }
}

export function failJob(jobId: string, error: string, stack?: string): void {
  for (const queue of queues.values()) {
    const job = queue.find((j) => j.jobId === jobId);
    if (!job) continue;

    // Record retry history
    const history = retryHistory.get(jobId) ?? [];
    history.push({ attemptedAt: new Date().toISOString(), error });
    retryHistory.set(jobId, history);

    if (job.attempts >= job.maxAttempts) {
      // Move to dead letter queue per 031: DEAD LETTER QUEUE
      job.status = "CANCELLED";
      const dlr: DeadLetterRecord = {
        originalJobId: jobId,
        jobType: job.jobType,
        payload: job.payload,
        failureReason: error,
        retryHistory: history,
        deadAt: new Date().toISOString(),
      };
      deadLetterQueue.push(dlr);
      logger.error("Job moved to dead letter queue", {
        metadata: { jobId, jobType: job.jobType },
      });
    } else {
      // Schedule retry with documented backoff (031: RETRY POLICY)
      const delayMs = RETRY_DELAYS_MS[job.attempts - 1] ?? RETRY_DELAYS_MS.at(-1)!;
      job.status = "RETRYING";
      job.errorMessage = error;
      job.errorStack = stack;
      job.nextRetryAt = new Date(Date.now() + delayMs).toISOString();
      logger.warn("Job scheduled for retry", {
        metadata: { jobId, attempt: job.attempts, delayMs },
      });
    }
    return;
  }
}

// ── Observability ──────────────────────────────────────────────────────────

export interface QueueStats {
  queueName: string;
  queued: number;
  running: number;
  retrying: number;
  completed: number;
  failed: number;
}

export function getQueueStats(): QueueStats[] {
  const stats: QueueStats[] = [];
  for (const [name, jobs] of queues.entries()) {
    stats.push({
      queueName: name,
      queued: jobs.filter((j) => j.status === "QUEUED").length,
      running: jobs.filter((j) => j.status === "RUNNING").length,
      retrying: jobs.filter((j) => j.status === "RETRYING").length,
      completed: jobs.filter((j) => j.status === "COMPLETED").length,
      failed: jobs.filter((j) => j.status === "CANCELLED").length,
    });
  }
  return stats;
}

export function getDeadLetterQueue(): readonly DeadLetterRecord[] {
  return deadLetterQueue;
}

// ── Sync job helpers ───────────────────────────────────────────────────────

/** Per 013: JOB PRIORITY — documented sync priority order */
const SYNC_PRIORITY: Record<SyncJobPayload["scope"], JobPriority> = {
  ORDERS: "HIGH",
  SHIPMENTS: "HIGH",
  SETTLEMENTS: "HIGH",
  MARKETING: "NORMAL",
};

export function enqueueSyncJob(payload: SyncJobPayload): JobRecord<SyncJobPayload> {
  return enqueue({
    jobType: `SYNC_${payload.scope}`,
    category: "SYNCHRONIZATION",
    priority: SYNC_PRIORITY[payload.scope],
    payload,
    metadata: { provider: payload.provider, storeId: payload.storeId },
  });
}
