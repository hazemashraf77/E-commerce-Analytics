/**
 * API response helpers.
 * Repository: 029_API_SPECIFICATION.md — RESPONSE FORMAT, ERROR FORMAT, ERROR CODES
 *
 * Every response follows one consistent structure (029).
 * Error codes shall remain stable across API versions (029).
 */

import { NextResponse } from "next/server";

// ── Documented error codes (029: ERROR CODES) ─────────────────────────────

export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  AUTHORIZATION_DENIED: "AUTHORIZATION_DENIED",
  ENTITY_NOT_FOUND: "ENTITY_NOT_FOUND",
  DUPLICATE_RECORD: "DUPLICATE_RECORD",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  FORMULA_ERROR: "FORMULA_ERROR",
  FIFO_ERROR: "FIFO_ERROR",
  SYNCHRONIZATION_FAILED: "SYNCHRONIZATION_FAILED",
  EXTERNAL_PROVIDER_ERROR: "EXTERNAL_PROVIDER_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ── Response shapes (029: RESPONSE FORMAT) ────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ── Response builders ──────────────────────────────────────────────────────

export function ok<T>(
  data: T,
  metadata?: Record<string, unknown>,
  status = 200,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { success: true, data, metadata, timestamp: new Date().toISOString() },
    { status },
  );
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, undefined, 201);
}

export function paginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): NextResponse<ApiSuccess<PaginatedData<T>>> {
  return ok(
    { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    { page, pageSize, total },
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// ── Common error responses ─────────────────────────────────────────────────

export const unauthorized = () =>
  apiError(API_ERROR_CODES.AUTHENTICATION_FAILED, "Authentication required.", 401);

export const forbidden = (role?: string) =>
  apiError(
    API_ERROR_CODES.AUTHORIZATION_DENIED,
    `Insufficient permissions${role ? ` for role ${role}` : ""}.`,
    403,
  );

export const notFound = (entity: string) =>
  apiError(API_ERROR_CODES.ENTITY_NOT_FOUND, `${entity} not found.`, 404);

export const validationError = (message: string, details?: Record<string, unknown>) =>
  apiError(API_ERROR_CODES.VALIDATION_ERROR, message, 422, details);

export const internalError = (requestId: string) =>
  apiError(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    `An unexpected error occurred. Request ID: ${requestId}`,
    500,
  );

// ── Async job response (029: LONG-RUNNING OPERATIONS) ─────────────────────

export function jobQueued(jobId: string, jobType: string): NextResponse<ApiSuccess<{ jobId: string; status: string; pollUrl: string }>> {
  return ok({
    jobId,
    status: "queued",
    pollUrl: `/api/v1/jobs/${jobId}`,
  }, { jobType });
}

// ── Request ID helper (029: REQUEST IDENTIFIERS) ──────────────────────────

export function generateRequestId(): string {
  return crypto.randomUUID();
}
