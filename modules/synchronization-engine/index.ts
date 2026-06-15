/**
 * Synchronization Engine — public API barrel.
 * Repository: 013_SYNCHRONIZATION_ENGINE.md, 012_API_ARCHITECTURE.md
 */

// Types
export type { Provider, SyncScope, AdapterError, AdapterErrorType, SyncResult, FetchOptions, AdapterConfig, IProviderAdapter, IOrderAdapter, IShippingAdapter, IMarketingAdapter, CanonicalOrder, CanonicalOrderItem, CanonicalShipment, CanonicalSettlement, CanonicalCampaign, CanonicalMarketingSpend } from "./types/adapter.types";
export type { JobRecord, JobStatus, JobPriority, JobCategory, SyncJobPayload, DeadLetterRecord } from "./types/job.types";
export { RETRY_DELAYS_MS, MAX_JOB_ATTEMPTS, JOB_QUEUES } from "./types/job.types";
export type { ValidationResult, ValidationIssue, StagedRecord } from "./types/validation.types";

// Queue
export { enqueue, dequeue, completeJob, failJob, enqueueSyncJob, getQueueStats, getDeadLetterQueue } from "./queue/job.queue";

// Engine
export { registerAdapter, executeSync, getProviderHealth } from "./application/sync.engine";

// Scheduler
export { SyncScheduler } from "./scheduler/sync.scheduler";

// Validation
export { runValidationPipeline, validateSchema, validateRequiredFields, checkDuplicate, buildStagedRecord } from "./domain/validation.pipeline";
