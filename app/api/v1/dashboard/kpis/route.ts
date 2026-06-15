/**
 * GET /api/v1/dashboard/kpis
 * Returns executive KPI dataset for a period.
 * Repository: 029_API_SPECIFICATION.md, 010_ANALYTICS_ENGINE.md, 032_PERMISSION_MATRIX.md
 * Auth: READ_ONLY minimum (all roles can view dashboards)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { DashboardQuerySchema } from "@/lib/api/schemas";
import { computeExecutiveKpiDataset } from "@/modules/analytics-engine";
import type { AnalyticsPeriod } from "@/modules/analytics-engine";

async function handler(request: NextRequest, auth: AuthContext) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = DashboardQuerySchema.safeParse(params);
  if (!parsed.success) {
    return validationError("Invalid query parameters", { issues: parsed.error.issues });
  }

  const { storeId, period, from, to } = parsed.data;
  const customRange = from && to ? { from: new Date(from), to: new Date(to) } : undefined;

  const dataset = await computeExecutiveKpiDataset(
    storeId,
    period as AnalyticsPeriod,
    customRange,
  );

  return ok(dataset, { requestId: auth.requestId, kpiCount: dataset.kpis.length, period });
}

export const GET = withAuth(handler, "READ_ONLY");
