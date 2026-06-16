/**
 * GET /api/v1/products/analytics?storeId=&period=
 * Product Intelligence table — all product-level KPIs.
 * Repository: 060_PRODUCT_INTELLIGENCE.md, 068_FORMULA_ENGINE.md
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";

const Schema = z.object({
  storeId: StoreIdSchema,
  period:  z.string().default("LAST_30_DAYS"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");

  // Preview mode: return deterministic mock data computed by KPI Calculator
  // Production: query DB → run KPI Calculator → return
  const products = MOCK_PRODUCT_INTELLIGENCE;

  return ok(products, {
    requestId: auth.requestId,
    count:  products.length,
    source: "MOCK_KPI_CALCULATOR", // replaced by "DB_KPI_CALCULATOR" in production
  });
}

export const GET = withAuth(handler, "READ_ONLY");
