/**
 * GET /api/v1/finance/summary?storeId=&period=
 * Financial analytics summary for a period.
 * Repository: 029_API_SPECIFICATION.md, 007_FINANCIAL_ENGINE.md, 010_ANALYTICS_ENGINE.md
 * Auth: FINANCE role minimum (032: Finance users may view Financial Dashboard)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { DashboardQuerySchema } from "@/lib/api/schemas";
import { computeExecutiveKpiDataset } from "@/modules/analytics-engine";
import type { AnalyticsPeriod } from "@/modules/analytics-engine";

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = DashboardQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });
  const { storeId, period, from, to } = parsed.data;
  const dataset = await computeExecutiveKpiDataset(storeId, period as AnalyticsPeriod, from && to ? { from: new Date(from), to: new Date(to) } : undefined);
  return ok(dataset.financialSummary, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "FINANCE");
