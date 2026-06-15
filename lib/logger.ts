import pino from "pino";

/**
 * Structured logger per 037_LOGGING_STANDARD.md.
 *
 * Standard log structure: timestamp, level, module, message, requestId,
 * correlationId, userId, entityType, entityId, metadata. Levels:
 * TRACE / DEBUG / INFO / WARN / ERROR / FATAL (pino-native).
 * Secrets are redacted (037: logs shall be secure).
 */

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

const root = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "*.password",
      "*.token",
      "*.accessToken",
      "*.apiKey",
      "*.secret",
      "*.authorization",
    ],
    censor: "[REDACTED]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
});

/**
 * Creates a module-scoped logger. Module names follow repository naming,
 * e.g. "FinancialEngine", "SynchronizationEngine", "Bootstrap".
 */
export function createLogger(module: string) {
  const child = root.child({ module });
  return {
    trace: (message: string, context: LogContext = {}) => child.trace(context, message),
    debug: (message: string, context: LogContext = {}) => child.debug(context, message),
    info: (message: string, context: LogContext = {}) => child.info(context, message),
    warn: (message: string, context: LogContext = {}) => child.warn(context, message),
    error: (message: string, context: LogContext = {}) => child.error(context, message),
    fatal: (message: string, context: LogContext = {}) => child.fatal(context, message),
  };
}

export type AppLogger = ReturnType<typeof createLogger>;
