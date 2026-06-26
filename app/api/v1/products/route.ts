import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError, serverError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { createProduct, listProducts } from "@/services/product.service";

const CreateProductSchema = z.object({
  storeId: StoreIdSchema,
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  defaultSellingPrice: z.number().nonnegative(),
  unitProductCost: z.number().nonnegative().optional(),
  packagingCost: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  minimumStockThreshold: z.number().int().nonnegative().optional(),
  externalIds: z.record(z.string(), z.string()).optional(),
});

async function getHandler(request: NextRequest, auth: AuthContext) {
  const storeId = request.nextUrl.searchParams.get("storeId");

  if (!storeId) {
    return validationError("storeId required");
  }

  const products = await listProducts(storeId);

  return ok(products, {
    requestId: auth.requestId,
    count: products.length,
    source: "DB",
  });
}

async function postHandler(request: NextRequest, auth: AuthContext) {
  try {
    const body = await request.json();
    const parsed = CreateProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError("Invalid product payload", {
        issues: parsed.error.issues,
      });
    }

    const product = await createProduct(parsed.data);

    return ok(product, {
      requestId: auth.requestId,
      source: "DB",
    });
  } catch (err) {
    return serverError("Failed to create product", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export const GET = withAuth(getHandler, "READ_ONLY");
export const POST = withAuth(postHandler, "WRITE");