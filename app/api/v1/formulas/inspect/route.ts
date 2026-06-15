/**
 * GET /api/v1/formulas/inspect?kpiId=
 * Returns the KPI definition and formula reference for Formula Inspector.
 * "Every financial value produced by the Financial Engine shall support
 *  Formula Inspector." (007)
 * Auth: READ_ONLY minimum
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { z } from "zod";
import { getKpiDefinition, KPI_REGISTRY } from "@/modules/analytics-engine";

const Schema = z.object({ kpiId: z.string().min(1).optional() });

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters");

  const { kpiId } = parsed.data;

  if (kpiId) {
    const def = getKpiDefinition(kpiId);
    if (!def) return notFound(`KPI ${kpiId}`);
    return ok(def, { requestId: auth.requestId });
  }

  // Return full registry when no kpiId specified
  return ok([...KPI_REGISTRY], { requestId: auth.requestId, count: KPI_REGISTRY.length });
}

export const GET = withAuth(handler, "READ_ONLY");
