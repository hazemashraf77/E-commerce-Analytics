/**
 * GET /api/v1/products/performance
 *
 * Repository: 076_METRICS_CATALOG.md, 075_HOMEPAGE_CONTRACT.md
 *
 * Per-product performance endpoint.
 * All calculations from ProductPerformanceService → Formula Engine.
 * No business logic in this route.
 *
 * Used by Sprint 2B Homepage table and future Product Detail pages.
 *
 * Query params:
 *   storeId   — required
 *   from, to  — ISO datetime (default: last 30 days)
 *   filter    — SmartFilter key (optional)
 *
 * Auth: READ_ONLY
 */

import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { computeProductPerformance } from "@/services/product-performance.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ProductsPerformanceAPI");

const QuerySchema = z.object({
  storeId: StoreIdSchema,
  from:    z.string().datetime().optional(),
  to:      z.string().datetime().optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return validationError("Invalid query", { issues: parsed.error.issues });
  }

  const { storeId } = parsed.data;
  const from = parsed.data.from ? new Date(parsed.data.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to   = parsed.data.to   ? new Date(parsed.data.to)   : new Date();

  logger.info("Product performance requested", {
    metadata: { storeId, from: from.toISOString(), to: to.toISOString() },
  });

  const result = await computeProductPerformance({ storeId, from, to });

  return ok({
    from:         from.toISOString(),
    to:           to.toISOString(),
    periodDays:   result.periodDays,
    productCount: result.products.length,
    products:     result.products,
    computedAt:   result.computedAt,
    source:       result.source,
  }, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
