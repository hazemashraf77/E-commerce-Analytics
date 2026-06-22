/**
 * GET /api/v1/analytics/aov-grouping?storeId=&from=&to=&strategy=&uplift=
 *
 * Returns AOV bucket grouping + suggested offer threshold.
 * Sprint 2B will use this for the homepage offer recommendation widget.
 */

import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { computeAOVGrouping } from "@/services/aov-grouping.service";

const Schema = z.object({
  storeId:  StoreIdSchema,
  from:     z.string().datetime().optional(),
  to:       z.string().datetime().optional(),
  strategy: z.enum(["AUTO", "QUARTILE", "FIXED"]).optional(),
  uplift:   z.coerce.number().min(0).max(2).optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return validationError("Invalid query", { issues: parsed.error.issues });
  }
  const { storeId, strategy, uplift } = parsed.data;
  const from = parsed.data.from ? new Date(parsed.data.from) : undefined;
  const to   = parsed.data.to   ? new Date(parsed.data.to)   : undefined;

  const result = await computeAOVGrouping({
    storeId, from, to, strategy, upliftOverride: uplift,
  });

  return ok(result, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
