/**
 * Error foundation. Error CODES are owned by 036_ERROR_CATALOG.md
 * (Source of Truth) — they are supplied by callers, never invented here.
 */

export type ErrorSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly cause?: unknown;

  constructor(options: {
    code: string;
    message: string;
    severity?: ErrorSeverity;
    cause?: unknown;
  }) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.severity = options.severity ?? "MEDIUM";
    this.cause = options.cause;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Normalizes unknown thrown values into an Error for safe logging. */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : JSON.stringify(value));
}
