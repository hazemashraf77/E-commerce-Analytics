/**
 * Validation pipeline types.
 * Repository: 013_SYNCHRONIZATION_ENGINE.md — VALIDATION PIPELINE,
 *             STAGING AREA, FAILED RECORDS, CONFLICT HANDLING
 *             012_API_ARCHITECTURE.md — STAGING AREA
 */

export type ValidationStage =
  | "SCHEMA_VALIDATION"
  | "REQUIRED_FIELD_VALIDATION"
  | "BUSINESS_VALIDATION"
  | "CANONICAL_CONVERSION"
  | "DUPLICATE_DETECTION";

export interface ValidationResult<T = unknown> {
  valid: boolean;
  stage?: ValidationStage;    // first stage that failed
  errors: ValidationIssue[];
  canonical?: T;              // populated only when valid
}

export interface ValidationIssue {
  field?: string;
  code: string;
  message: string;
}

/** Staged record per 013: STAGING AREA / 006: import_staging table */
export interface StagedRecord {
  provider: string;
  entityType: string;
  externalId: string;
  rawPayload: unknown;
  validationErrors: ValidationIssue[] | null;
  status: "PENDING" | "VALID" | "INVALID" | "PROCESSED" | "FAILED";
  retryCount: number;
}

/** Conflict info per 013: CONFLICT HANDLING */
export interface ConflictRecord {
  entityType: string;
  externalId: string;
  existingValue: unknown;
  incomingValue: unknown;
  flaggedAt: string;
  resolved: boolean;
}
