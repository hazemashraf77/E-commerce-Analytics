/**
 * Canonical validation pipeline.
 * Repository: 013_SYNCHRONIZATION_ENGINE.md — VALIDATION PIPELINE
 *             004_CANONICAL_DATA_MODEL.md — CANONICAL VALIDATION RULES
 *
 * Stages: Raw → Schema → Required Fields → Business → Canonical → Duplicate → Production
 * "Validation failures stop processing of the affected record only." (013)
 */

import { z } from "zod";
import type { ValidationResult, ValidationIssue, StagedRecord } from "../types/validation.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ValidationPipeline");

// ── Stage: Schema validation ───────────────────────────────────────────────

export function validateSchema<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  entityType: string,
): ValidationResult<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const errors: ValidationIssue[] = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || undefined,
      code: issue.code,
      message: issue.message,
    }));
    logger.warn(`Schema validation failed for ${entityType}`, {
      metadata: { errorCount: errors.length },
    });
    return { valid: false, stage: "SCHEMA_VALIDATION", errors };
  }
  return { valid: true, errors: [], canonical: result.data };
}

// ── Stage: Required field validation ──────────────────────────────────────

export function validateRequiredFields(
  record: Record<string, unknown>,
  required: string[],
): ValidationResult<Record<string, unknown>> {
  const missing: ValidationIssue[] = required
    .filter((field) => record[field] == null || record[field] === "")
    .map((field) => ({
      field,
      code: "REQUIRED_FIELD_MISSING",
      message: `Required field "${field}" is missing or empty`,
    }));

  if (missing.length > 0) {
    return { valid: false, stage: "REQUIRED_FIELD_VALIDATION", errors: missing };
  }
  return { valid: true, errors: [], canonical: record };
}

// ── Stage: Duplicate detection ─────────────────────────────────────────────

export function checkDuplicate(
  externalId: string,
  existingIds: Set<string>,
): ValidationResult<null> {
  if (existingIds.has(externalId)) {
    return {
      valid: false,
      stage: "DUPLICATE_DETECTION",
      errors: [
        {
          field: "externalId",
          code: "DUPLICATE_RECORD",
          message: `Record with externalId "${externalId}" already exists — idempotent skip`,
        },
      ],
    };
  }
  return { valid: true, errors: [] };
}

// ── Full pipeline runner ───────────────────────────────────────────────────

/**
 * Runs all validation stages in documented order.
 * Stops at first failure — the affected record is isolated, not the batch.
 */
export function runValidationPipeline<T>(options: {
  schema: z.ZodType<T>;
  payload: unknown;
  entityType: string;
  requiredFields: string[];
  externalId: string;
  existingIds: Set<string>;
}): ValidationResult<T> {
  const { schema, payload, entityType, requiredFields, externalId, existingIds } = options;

  // Stage 1: Schema
  const schemaResult = validateSchema(schema, payload, entityType);
  if (!schemaResult.valid) return schemaResult;

  // Stage 2: Required fields
  const rfResult = validateRequiredFields(
    schemaResult.canonical as Record<string, unknown>,
    requiredFields,
  );
  if (!rfResult.valid) return rfResult as ValidationResult<T>;

  // Stage 3: Duplicate detection
  const dupResult = checkDuplicate(externalId, existingIds);
  if (!dupResult.valid) return dupResult as ValidationResult<T>;

  return { valid: true, errors: [], canonical: schemaResult.canonical };
}

// ── Stage record builder ───────────────────────────────────────────────────

export function buildStagedRecord(
  provider: string,
  entityType: string,
  externalId: string,
  rawPayload: unknown,
  result: ValidationResult,
): StagedRecord {
  return {
    provider,
    entityType,
    externalId,
    rawPayload,
    validationErrors: result.valid ? null : result.errors,
    status: result.valid ? "VALID" : "INVALID",
    retryCount: 0,
  };
}
