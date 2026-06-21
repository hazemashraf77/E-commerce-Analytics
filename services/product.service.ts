/**
 * Product Service — Sprint 2A
 *
 * Manual catalog management. Sprint 2B builds the UI on top of this.
 *
 * Rules:
 * - Products are ALWAYS created manually by the user — never by sync.
 * - SKU is the primary business key per store.
 * - On product create/update with externalIds, eagerly trigger resolution
 *   of any matching ProviderOrderItem rows (path defined in resolution.service).
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { resolveUnmappedItems } from "./provider-order-item.service";

const logger = createLogger("ProductService");

export interface CreateProductInput {
  storeId:                string;
  sku:                    string;
  name:                   string;
  category?:              string;
  defaultSellingPrice:    number;
  unitProductCost?:       number;
  packagingCost?:         number;
  imageUrl?:              string;
  minimumStockThreshold?: number;
  /** Map of provider → external ID, e.g. { EASYORDERS: "ext_abc123" } */
  externalIds?: Record<string, string>;
}

export interface UpdateProductInput {
  name?:                  string;
  category?:              string | null;
  defaultSellingPrice?:   number;
  unitProductCost?:       number | null;
  packagingCost?:         number;
  imageUrl?:              string | null;
  minimumStockThreshold?: number;
  externalIds?:           Record<string, string> | null;
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      storeId:               input.storeId,
      sku:                   input.sku.trim(),
      name:                  input.name.trim(),
      category:              input.category?.trim(),
      defaultSellingPrice:   new Decimal(input.defaultSellingPrice),
      unitProductCost:       input.unitProductCost != null ? new Decimal(input.unitProductCost) : null,
      packagingCost:         new Decimal(input.packagingCost ?? 0),
      imageUrl:              input.imageUrl ?? null,
      minimumStockThreshold: input.minimumStockThreshold ?? 0,
      externalIds:           input.externalIds as object | undefined,
    },
  });

  logger.info("Product created", {
    metadata: { productId: product.id, sku: product.sku, storeId: input.storeId },
  });

  // Resolution: if any unmapped provider items match this SKU or externalId, link them
  await resolveUnmappedItems(input.storeId, {
    productId: product.id,
    sku: product.sku,
    externalIds: input.externalIds,
  }).catch((err) => {
    logger.warn("Resolution after createProduct failed", { metadata: { error: String(err) } });
  });

  return product;
}

export async function updateProduct(
  storeId: string,
  productId: string,
  input: UpdateProductInput,
) {
  const data: Record<string, unknown> = {};

  if (input.name !== undefined)                 data.name = input.name.trim();
  if (input.category !== undefined)             data.category = input.category;
  if (input.defaultSellingPrice !== undefined)  data.defaultSellingPrice = new Decimal(input.defaultSellingPrice);
  if (input.unitProductCost !== undefined)      data.unitProductCost = input.unitProductCost == null ? null : new Decimal(input.unitProductCost);
  if (input.packagingCost !== undefined)        data.packagingCost = new Decimal(input.packagingCost);
  if (input.imageUrl !== undefined)             data.imageUrl = input.imageUrl;
  if (input.minimumStockThreshold !== undefined) data.minimumStockThreshold = input.minimumStockThreshold;
  if (input.externalIds !== undefined)          data.externalIds = input.externalIds as object | null;

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  logger.info("Product updated", {
    metadata: { productId, storeId, fields: Object.keys(data) },
  });

  if (input.externalIds !== undefined && input.externalIds) {
    await resolveUnmappedItems(storeId, {
      productId: product.id,
      sku: product.sku,
      externalIds: input.externalIds,
    }).catch((err) => {
      logger.warn("Resolution after updateProduct failed", { metadata: { error: String(err) } });
    });
  }

  return product;
}

export async function listProducts(storeId: string, options: {
  status?: "ACTIVE" | "INACTIVE";
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  return prisma.product.findMany({
    where: {
      storeId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.includeDeleted ? {} : { isDeleted: false }),
    },
    orderBy: { name: "asc" },
    take: options.limit ?? 100,
    skip: options.offset ?? 0,
  });
}

export async function getProductBySku(storeId: string, sku: string) {
  return prisma.product.findUnique({
    where: { storeId_sku: { storeId, sku: sku.trim() } },
  });
}

export async function findProductByExternalId(
  storeId: string,
  provider: string,
  externalId: string,
) {
  // 1. Search the externalIds JSON field on products
  const products = await prisma.product.findMany({
    where: { storeId, isDeleted: false },
    select: { id: true, sku: true, externalIds: true },
  });

  for (const p of products) {
    const ids = p.externalIds as Record<string, string> | null;
    if (ids && ids[provider] === externalId) return p;
  }

  // 2. Fall back to ProductAlias lookup
  const alias = await prisma.productAlias.findFirst({
    where: {
      provider,
      aliasName: externalId,
      aliasType: "provider_id",
      status:    "ACTIVE",
    },
    include: { product: { select: { id: true, sku: true } } },
  });

  return alias?.product ?? null;
}

export async function softDeleteProduct(
  storeId: string,
  productId: string,
  deletedBy: string,
) {
  return prisma.product.update({
    where: { id: productId },
    data:  { isDeleted: true, deletedAt: new Date(), deletedBy },
  });
}
