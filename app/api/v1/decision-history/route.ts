/**
 * GET /api/v1/decision-history?storeId=&status=&category=&from=&to=&page=&pageSize=
 * Returns historical decision records with full status history.
 * Repository Consistency Pass 2026-06-12 — Task 4
 * Auth: MANAGER
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema, PaginationSchema } from "@/lib/api/schemas";
import { getDecisionHistory } from "@/modules/decision-engine/repositories/historical-decision.repository";

const Schema = z.object({
  storeId:  StoreIdSchema,
  status:   z.enum(["OPEN","ACKNOWLEDGED","ACCEPTED","REJECTED","EXECUTING","COMPLETED","EXPIRED","ARCHIVED"]).optional(),
  category: z.enum(["MARKETING","INVENTORY","SHIPPING","FINANCIAL","OPERATIONAL","EXECUTIVE"]).optional(),
  from:     z.string().datetime({ offset: true }).optional(),
  to:       z.string().datetime({ offset: true }).optional(),
}).merge(PaginationSchema);

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, status, category, from, to, page, pageSize } = parsed.data;
  const { records, total } = await getDecisionHistory({
    storeId, status, category,
    from: from ?? undefined,
    to: to ?? undefined,
    page, pageSize,
  });

  return ok(
    { items: records, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    { requestId: auth.requestId, count: records.length },
  );
}

export const GET = withAuth(handler, "MANAGER");
