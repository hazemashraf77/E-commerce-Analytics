/**
 * Retry engine.
 * Repository: 073_API_INTEGRATION_BIBLE.md — Retry Engine, Error Handling
 *             013_SYNCHRONIZATION_ENGINE.md — RETRY DELAYS
 *
 * Retry delays: [30s, 2min, 10min] per 013.
 * All provider calls route through this engine.
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("RetryEngine");

/** Retry delays in milliseconds per 013_SYNCHRONIZATION_ENGINE retry schedule */
export const RETRY_DELAYS_MS = [30_000, 120_000, 600_000] as const;

export interface RetryOptions {
  maxAttempts?: number;           // default 3
  delays?: readonly number[];     // defaults to RETRY_DELAYS_MS
  operationName: string;
  providerKey: string;
}

export interface RetryResult<T> {
  success: boolean;
  value?: T;
  error?: unknown;
  attemptsMade: number;
  lastErrorMessage?: string;
}

/**
 * Execute an async operation with retry logic.
 * On failure: waits per documented delay schedule, then retries.
 * Never throws — returns RetryResult so caller can decide action.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<RetryResult<T>> {
  const { maxAttempts = 3, delays = RETRY_DELAYS_MS, operationName, providerKey } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await operation();
      if (attempt > 1) {
        logger.info("Retry succeeded", {
          metadata: { operationName, providerKey, attempt },
        });
      }
      return { success: true, value, attemptsMade: attempt };
    } catch (err) {
      lastError = err;
      const errorMsg = err instanceof Error ? err.message : String(err);

      logger.warn("Sync attempt failed", {
        metadata: { operationName, providerKey, attempt, maxAttempts, error: errorMsg },
      });

      if (attempt < maxAttempts) {
        const delayMs = delays[attempt - 1] ?? delays.at(-1) ?? 30_000;
        logger.info("Waiting before retry", {
          metadata: { operationName, providerKey, delayMs, nextAttempt: attempt + 1 },
        });
        await sleep(delayMs);
      }
    }
  }

  const lastErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  logger.error("All retry attempts exhausted", {
    metadata: { operationName, providerKey, maxAttempts, lastErrorMessage },
  });

  return {
    success: false,
    error: lastError,
    attemptsMade: maxAttempts,
    lastErrorMessage,
  };
}

/** Non-blocking sleep for retry delays */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check whether an error is retryable.
 * Rate-limit and transient network errors are retryable.
 * Auth and validation errors are not.
 */
export function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return true; // unknown errors: retry

  const msg = err.message.toLowerCase();
  // Do not retry auth / validation errors
  if (msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("invalid")) {
    return false;
  }
  // Rate-limit, timeout, network: retry
  return (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("timeout") ||
    msg.includes("network") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("500")
  );
}
