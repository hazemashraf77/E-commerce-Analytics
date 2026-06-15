/**
 * POST /api/v1/inventory/purchases
 * Records a new inventory purchase (creates FIFO layer).
 * "Every inventory purchase creates a new FIFO layer." (BR-015, 008)
 * Auth: INVENTORY minimum (032)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { created, validationError } from "@/lib/api/response";
import { CreatePurchaseSchema } from "@/lib/api/schemas";
import { recordPurchase } from "@/modules/inventory-engine";

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Request body must be valid JSON"); }

  const parsed = CreatePurchaseSchema.safeParse(body);
  if (!parsed.success) return validationError("Invalid purchase data", { issues: parsed.error.issues });

  const { storeId, productId, purchaseDate, quantity, unitCost, supplier, purchaseReference } = parsed.data;

  const layer = await recordPurchase({
    storeId, productId,
    purchaseDate: new Date(purchaseDate),
    quantity: String(quantity),
    unitCost: String(unitCost),
    supplier: supplier ?? null,
    purchaseReference: purchaseReference ?? null,
  });

  return created({ layerId: layer.id, productId, quantity, unitCost, requestId: auth.requestId });
}

export const POST = withAuth(handler, "INVENTORY");
