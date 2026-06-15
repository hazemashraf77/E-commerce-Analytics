/**
 * Global type definitions.
 * Business entity types are generated from the Canonical Data Model
 * (004_CANONICAL_DATA_MODEL.md) in the Database sprint — nothing is
 * invented here (CP-002).
 */

export type { AppLocale } from "@/config/i18n/routing";
export type { Role } from "@/lib/auth/rbac";
export type { AppLogger, LogContext } from "@/lib/logger";
export type { AppError } from "@/utils/errors";

/** Generic API response envelope used by route handlers (029_API_SPECIFICATION.md). */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

/** Supported locale union — kept in sync with config/i18n/routing.ts. */
export type SupportedLocale = "en" | "ar";
