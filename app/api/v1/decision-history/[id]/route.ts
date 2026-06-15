/**
 * GET /api/v1/decision-history/[id]
 * Returns a single historical decision with complete status history.
 * Repository Consistency Pass 2026-06-12 — Task 4
 * Auth: MANAGER
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { getDecisionById } from "@/modules/decision-engine/repositories/historical-decision.repository";

const ParamSchema = z.object({ id: z.string().uuid() });

async function handler(
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string>,
) {
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) return validationError("Invalid decision ID");

  const record = await getDecisionById(parsed.data.id);
  if (!record) return notFound("Decision");

  return ok(record, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "MANAGER");
