/**
 * GET  /api/v1/reports/schedule?storeId= — list scheduled reports
 * POST /api/v1/reports/schedule — create a scheduled report
 * Repository: 017_REPORTING_ENGINE.md v2.0.0 — SCHEDULED REPORTS
 * Auth: MANAGER (scheduling requires elevated access)
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, created, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { createScheduledReport, getScheduledReports } from "@/modules/reporting-engine/application/reporting.engine";

const CreateSchema = z.object({
  storeId: StoreIdSchema,
  category: z.enum(["EXECUTIVE","FINANCIAL","INVENTORY","MARKETING","SHIPPING","CASH_FLOW","SETTLEMENT","SCORE","DECISION","PRODUCT","AI_SUMMARY","OPERATIONAL"]),
  frequency: z.enum(["DAILY","WEEKLY","MONTHLY"]),
  format: z.enum(["PDF","EXCEL","CSV"]).default("PDF"),
  isActive: z.boolean().default(true),
  nextScheduledAt: z.string().datetime({ offset: true }),
});

async function getHandler(request: NextRequest, auth: AuthContext) {
  const storeId = request.nextUrl.searchParams.get("storeId");
  if (!storeId || !StoreIdSchema.safeParse(storeId).success) return validationError("storeId required");
  const schedules = getScheduledReports(storeId);
  return ok(schedules, { requestId: auth.requestId, count: schedules.length });
}

async function postHandler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Invalid JSON"); }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return validationError("Invalid schedule data", { issues: parsed.error.issues });
  const schedule = createScheduledReport({ ...parsed.data, createdBy: auth.userId, createdAt: new Date().toISOString() });
  return created({ scheduleId: schedule.scheduleId, category: schedule.category, frequency: schedule.frequency });
}

export const GET  = withAuth(getHandler, "MANAGER");
export const POST = withAuth(postHandler, "MANAGER");
