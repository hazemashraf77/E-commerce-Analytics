/**
 * GET /api/v1/inventory/availability?storeId=&productId=
 * Returns stock availability for a product or all products in a store.
 * Auth: INVENTORY minimum (032)
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { getProductAvailability, getAllProductAvailabilities } from "@/modules/inventory-engine";

const Schema = z.object({
  storeId: StoreIdSchema,
  productId: z.string().uuid().optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, productId } = parsed.data;
  if (productId) {
    const availability = await getProductAvailability(productId, storeId);
    return ok(availability, { requestId: auth.requestId });
  }
  const all = await getAllProductAvailabilities(storeId);
  return ok(all, { requestId: auth.requestId, count: all.length });
}

export const GET = withAuth(handler, "INVENTORY");
