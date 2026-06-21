/**
 * Product Alias Service — Sprint 2A
 *
 * ProductAlias is the bridge between provider data and our catalog.
 * Two alias kinds:
 *   - Marketing aliases  (platform = META / TIKTOK) — used for ad-to-product matching
 *   - Operational aliases (provider = "EASYORDERS") — used for order item resolution
 *
 * aliasType:
 *   - "name"          — match by product name string
 *   - "sku"           — match by SKU (rarely needed since products are SKU-keyed)
 *   - "provider_id"   — match by provider's internal product ID
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { resolveUnmappedItems } from "./provider-order-item.service";

const logger = createLogger("ProductAliasService");

export interface CreateAliasInput {
  storeId:   string;            // for resolution scope
  productId: string;
  aliasName: string;
  aliasType: "name" | "sku" | "provider_id";
  // Either platform (marketing) or provider (operational) — at least one required
  platform?: "META" | "TIKTOK" | null;
  provider?: string | null;     // "EASYORDERS" etc.
}

export async function createAlias(input: CreateAliasInput) {
  if (!input.platform && !input.provider) {
    throw new Error("Either platform (marketing) or provider (operational) is required");
  }

  const alias = await prisma.productAlias.create({
    data: {
      productId: input.productId,
      aliasName: input.aliasName.trim(),
      aliasType: input.aliasType,
      platform:  input.platform ?? null,
      provider:  input.provider ?? null,
      status:    "ACTIVE",
    },
  });

  logger.info("ProductAlias created", {
    metadata: {
      productId: input.productId,
      aliasName: input.aliasName,
      aliasType: input.aliasType,
      platform:  input.platform,
      provider:  input.provider,
    },
  });

  // Trigger resolution for the alias's owning product
  await resolveUnmappedItems(input.storeId, {
    productId: input.productId,
  }).catch((err) => {
    logger.warn("Resolution after createAlias failed", { metadata: { error: String(err) } });
  });

  return alias;
}

export async function listAliases(productId: string) {
  return prisma.productAlias.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteAlias(aliasId: string) {
  return prisma.productAlias.update({
    where: { id: aliasId },
    data:  { status: "INACTIVE" },
  });
}

/**
 * Find product by alias — search all alias kinds.
 * Used by resolution to match ProviderOrderItem.sku / providerProductId / productName.
 */
export async function findProductByAlias(
  provider: string,
  aliasName: string,
  aliasType: "name" | "sku" | "provider_id",
): Promise<{ id: string; sku: string } | null> {
  const alias = await prisma.productAlias.findFirst({
    where: {
      aliasName,
      aliasType,
      provider,
      status: "ACTIVE",
    },
    include: { product: { select: { id: true, sku: true, isDeleted: true } } },
  });

  if (!alias || !alias.product || alias.product.isDeleted) return null;
  return { id: alias.product.id, sku: alias.product.sku };
}
