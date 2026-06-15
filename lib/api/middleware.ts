/**
 * API middleware utilities.
 * Repository: 029_API_SPECIFICATION.md — REQUEST FLOW, AUTHENTICATION, AUTHORIZATION,
 *             AUDITABILITY, REQUEST IDENTIFIERS
 *             032_PERMISSION_MATRIX.md — role capabilities
 *             018_SECURITY_ARCHITECTURE.md — auth rules
 *
 * Request flow per 029:
 *   Client → Authentication → Authorization → Validation → Business Engine → Response
 * "Business logic is never executed before validation." (029)
 */

import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasRoleAtLeast, isRole, type Role } from "@/lib/auth/rbac";
import { createLogger } from "@/lib/logger";
import { unauthorized, forbidden, internalError, generateRequestId } from "./response";

const logger = createLogger("ApiMiddleware");

// ── Auth context ───────────────────────────────────────────────────────────

export interface AuthContext {
  userId: string;
  role: Role;
  requestId: string;
}

// ── Authenticated route handler type ──────────────────────────────────────

export type AuthenticatedHandler = (
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string>,
) => Promise<NextResponse>;

// ── withAuth — enforces authentication + minimum role (029, 032) ──────────

/**
 * Wraps a route handler with:
 *  1. Request ID generation (029: X-Request-ID)
 *  2. Authentication check (029: 401 for unauthenticated)
 *  3. Role-based authorization (029: 403, 032: role hierarchy)
 *  4. Audit logging on write operations (029: AUDITABILITY)
 *  5. Error boundary with request ID in error response
 */
export function withAuth(
  handler: AuthenticatedHandler,
  requiredRole: Role = "READ_ONLY",
) {
  return async (
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      // Step 1: Authentication
      // Preview bypass: if Supabase URL is placeholder, inject a mock session
      const isPreviewMode =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isPreviewMode) {
        const previewAuth: AuthContext = {
          userId: "preview-user-00000000-0000-0000-0000-000000000001",
          role: "ADMINISTRATOR",
          requestId,
        };
        return await handler(request, previewAuth, context?.params);
      }

      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn("Unauthenticated request", {
          requestId,
          metadata: { path: request.nextUrl.pathname, method: request.method },
        });
        return unauthorized();
      }

      // Step 2: Load role from DB user record
      // Role stored in users.role (populated at registration)
      const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("supabaseId", user.id)
        .single();

      const role = dbUser?.role;
      if (!role || !isRole(role)) {
        return forbidden("unassigned");
      }

      // Step 3: Authorization — check role hierarchy (032)
      if (!hasRoleAtLeast(role, requiredRole)) {
        logger.warn("Authorization denied", {
          requestId,
          userId: user.id,
          metadata: { role, requiredRole, path: request.nextUrl.pathname },
        });
        return forbidden(role);
      }

      const auth: AuthContext = { userId: user.id, role, requestId };

      // Step 4: Audit write operations (029: AUDITABILITY)
      const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
      if (isWrite) {
        logger.info("API write operation", {
          requestId,
          userId: user.id,
          metadata: {
            method: request.method,
            path: request.nextUrl.pathname,
            role,
          },
        });
      }

      return await handler(request, auth, context?.params);
    } catch (err) {
      logger.error("API handler error", {
        requestId,
        metadata: { error: String(err), path: request.nextUrl.pathname },
      });
      return internalError(requestId);
    }
  };
}

// ── Request parsing helpers ────────────────────────────────────────────────

export function parsePagination(request: NextRequest): { page: number; pageSize: number } {
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(request.nextUrl.searchParams.get("pageSize") ?? "20", 10)),
  );
  return { page, pageSize };
}

export function parseSorting(
  request: NextRequest,
  allowedFields: string[],
  defaultField: string,
): { sortBy: string; sortDirection: "asc" | "desc" } {
  const rawField = request.nextUrl.searchParams.get("sortBy") ?? defaultField;
  const sortBy = allowedFields.includes(rawField) ? rawField : defaultField;
  const rawDir = request.nextUrl.searchParams.get("sortDirection") ?? "desc";
  const sortDirection = rawDir === "asc" ? "asc" : "desc";
  return { sortBy, sortDirection };
}

export function parseDateRange(
  request: NextRequest,
): { from: Date | null; to: Date | null } {
  const fromStr = request.nextUrl.searchParams.get("from");
  const toStr = request.nextUrl.searchParams.get("to");
  return {
    from: fromStr ? new Date(fromStr) : null,
    to: toStr ? new Date(toStr) : null,
  };
}
