/**
 * POST /api/v1/reports — generate a report
 * Repository: 017_REPORTING_ENGINE.md v2.0.0, 029_API_SPECIFICATION.md
 * Auth: READ_ONLY minimum (report generation by any authenticated user)
 */
import { type NextRequest } from "next/server";
import { z } from "zod";

import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { generateReport } from "@/modules/reporting-engine/application/reporting.engine";

const Schema = z.object({
  storeId: StoreIdSchema,
  category: z.enum(["EXECUTIVE","FINANCIAL","INVENTORY","MARKETING","SHIPPING","CASH_FLOW","SETTLEMENT","SCORE","DECISION","PRODUCT","AI_SUMMARY","OPERATIONAL"]),
  period: z.enum(["TODAY","YESTERDAY","LAST_7_DAYS","LAST_30_DAYS","THIS_MONTH","LAST_MONTH","THIS_QUARTER","THIS_YEAR","CUSTOM"]).default("LAST_30_DAYS"),
  from: z.string().datetime({ offset: true }).optional(),
  to:   z.string().datetime({ offset: true }).optional(),
  format: z.enum(["PDF","EXCEL","CSV"]).default("PDF"),
  includeAppendices: z.boolean().default(true),
  viewMode: z.enum(["ORDERS","ITEMS"]).default("ORDERS"),
  showProjected: z.boolean().default(false),
});

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Request body must be valid JSON"); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError("Invalid report request", { issues: parsed.error.issues });

  const report = await generateReport({
    reportId: crypto.randomUUID(),
    ...parsed.data,
    requestedBy: auth.userId,
    requestedAt: new Date().toISOString(),
  });

  return ok(report, { requestId: auth.requestId, sectionCount: report.sections.length });
}

export const POST = withAuth(handler, "READ_ONLY");
