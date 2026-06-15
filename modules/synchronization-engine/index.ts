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

// Registry (073: Provider Registry)
export { PROVIDER_REGISTRY, resolveProviderStatus, getProviderStatuses } from "./registry/provider.registry";
export type { ProviderKey, ProviderCategory, ProviderStatus, ProviderDefinition } from "./registry/provider.registry";

// Retry engine (073: Retry Engine)
export { withRetry, isRetryableError, RETRY_DELAYS_MS as RETRY_DELAYS } from "./retry/retry.engine";
export type { RetryOptions, RetryResult } from "./retry/retry.engine";

// Business events (074: Business Event Model)
export { buildBusinessEvent, orderStatusToEventType, shipmentStatusToEventType } from "./events/business-event.factory";
export type { BusinessEvent, BusinessEventType } from "./events/business-event.factory";

// Sync history / audit (073: Audit)
export { recordSyncStart, recordSyncEnd, getSyncHistory } from "./events/sync-history";
export type { SyncHistoryRecord, SyncOutcome } from "./events/sync-history";
