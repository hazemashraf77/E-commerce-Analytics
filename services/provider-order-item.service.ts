/**
 * ProviderOrderItem Service — Sprint 2A
 *
 * Permanent table replacing ImportStaging use for ORDER_ITEM entities.
 * Every order item received from EasyOrders is stored here BEFORE it's mapped
 * to a Product. This is the bridge to our manual catalog.
 *
 * Lifecycle:
 *   1. Webhook / batch sync writes via `upsertProviderOrderItem` (status=UNMAPPED)
 *   2. User creates Product (matching SKU) or ProductAlias
 *   3. `resolveUnmappedItems` matches and promotes to status=MAPPED
 *      + creates corresponding OrderItem row (mirror for analytics queries)
 *
 * Backward compatibility:
 *   The Sprint 1 sync services keep writing to ImportStaging too (during transition).
 *   A separate migration job can later backfill historical ImportStaging rows.
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { findProductByAlias } from "./product-alias.service";
import type {
  ProviderOrderItemMappingResult,
} from "@/types/provider-order-item";

const logger = createLogger("ProviderOrderItemService");

export interface UpsertProviderOrderItemInput {
  storeId:           string;
  provider:          string;            // "EASYORDERS"
  providerOrderId:   string;
  orderId?:          string;            // FK once Order row exists
  itemIndex:         number;
  providerProductId?: string;
  sku?:              string;
  productName?:      string;
  quantity:          number;
  unitPrice:         number;
  discount:          number;
  rawPayload:        Record<string, unknown>;
}

/**
 * Upsert by (provider, providerOrderId, itemIndex) — idempotent re-import.
 * Eagerly tries to map to an existing Product (by SKU or alias).
 */
export async function upsertProviderOrderItem(input: UpsertProviderOrderItemInput) {
  const { storeId, provider, providerOrderId, itemIndex } = input;

  // Try to map immediately
  const mapping = await tryMapping(storeId, provider, {
    sku:               input.sku,
    providerProductId: input.providerProductId,
    productName:       input.productName,
  });

  const data = {
    storeId,
    provider,
    providerOrderId,
    orderId:           input.orderId ?? null,
    itemIndex,
    providerProductId: input.providerProductId ?? null,
    sku:               input.sku ?? null,
    productName:       input.productName ?? null,
    quantity:          new Decimal(isFinite(input.quantity)  ? input.quantity  : 0),
    unitPrice:         new Decimal(isFinite(input.unitPrice) ? input.unitPrice : 0),
    discount:          new Decimal(isFinite(input.discount)  ? input.discount  : 0),
    productId: mapping?.productId ?? null,
    status:            mapping ? "MAPPED" : "UNMAPPED",
    matchedBy:         mapping?.matchedBy ?? null,
    confidenceScore:   mapping?.confidenceScore != null ? new Decimal(mapping.confidenceScore) : null,
    mappedAt:          mapping ? new Date() : null,
    rawPayload:        input.rawPayload as object,
  };

  const result = await prisma.providerOrderItem.upsert({
    where: {
      provider_providerOrderId_itemIndex: { provider, providerOrderId, itemIndex },
    },
    update: {
      // Only update mutable fields; preserve initial import timestamp
      orderId:           data.orderId,
      providerProductId: data.providerProductId,
      sku:               data.sku,
      productName:       data.productName,
      quantity:          data.quantity,
      unitPrice:         data.unitPrice,
      discount:          data.discount,
      productId:         data.productId,
      status:            data.status,
      matchedBy: data.matchedBy,
      confidenceScore: data.confidenceScore,
      mappedAt:          data.mappedAt,
      rawPayload:        data.rawPayload,
    },
    create: data,
  });

  // If we mapped on import, also create the mirror OrderItem
  if (mapping && input.orderId) {
    await mirrorOrderItem(input.orderId, mapping.productId, result.id, {
      quantity:  input.quantity,
      unitPrice: input.unitPrice,
      discount:  input.discount,
    }).catch((err) => {
      logger.warn("Mirror OrderItem failed on upsert", { metadata: { error: String(err) } });
    });
  }

  return result;
}

/**
 * Try to map a single provider item to a Product.
 * Order of attempts:
 *   1. Product.externalIds[provider] == providerProductId
 *   2. ProductAlias provider_id match
 *   3. Product by SKU
 *   4. ProductAlias name match
 */
async function tryMapping(
  storeId: string,
  provider: string,
  refs: { sku?: string; providerProductId?: string; productName?: string },
): Promise<ProviderOrderItemMappingResult | null> {
  // 1. externalIds JSON
  if (refs.providerProductId) {
    const products = await prisma.product.findMany({
      where: { storeId, isDeleted: false },
      select: { id: true, sku: true, externalIds: true },
    });
    for (const p of products) {
      const ids = p.externalIds as Record<string, string> | null;
      if (ids && ids[provider] === refs.providerProductId) {
        return { productId: p.id, sku: p.sku, matchedBy: "EXTERNAL_ID", confidenceScore: 1 };
      }
    }

    // 2. ProductAlias provider_id
    const byProviderId = await findProductByAlias(provider, refs.providerProductId, "provider_id");
    if (byProviderId) {
    return {
    productId: byProviderId.id,
    sku: byProviderId.sku,
    matchedBy: "PROVIDER_ID_ALIAS",
    confidenceScore: 0.98,
  };
}
  }

  // 3. Product by SKU
  if (refs.sku) {
    const bySku = await prisma.product.findUnique({
      where: { storeId_sku: { storeId, sku: refs.sku } },
      select: { id: true, sku: true, isDeleted: true },
    });
    if (bySku && !bySku.isDeleted) {
  return { productId: bySku.id, sku: bySku.sku, matchedBy: "SKU", confidenceScore: 0.95 };
}

    // SKU alias
    const skuAlias = await findProductByAlias(provider, refs.sku, "sku");
    if (skuAlias) {
  return {
    productId: skuAlias.id,
    sku: skuAlias.sku,
    matchedBy: "SKU_ALIAS",
    confidenceScore: 0.9,
  };
}
  }

  // 4. Name alias (lower priority — names are noisy)
  if (refs.productName) {
    const nameAlias = await findProductByAlias(provider, refs.productName, "name");
    if (nameAlias) {
  return {
    productId: nameAlias.id,
    sku: nameAlias.sku,
    matchedBy: "NAME_ALIAS",
    confidenceScore: 0.8,
  };
}
  }

  return null;
}

/**
 * Promote unmapped items to MAPPED when a matching Product is created/updated.
 * Triggered by:
 *   - createProduct / updateProduct (with externalIds)
 *   - createAlias
 */
export async function resolveUnmappedItems(
  storeId: string,
  hint: {
    productId?: string;       // resolve only items that would map to this product
    sku?:       string;
    externalIds?: Record<string, string>;
  },
): Promise<{ resolved: number; failed: number }> {
  let resolved = 0;
  let failed   = 0;

  // Pull a batch of UNMAPPED items for this store
  const unmapped = await prisma.providerOrderItem.findMany({
    where: {
      storeId,
      status: "UNMAPPED",
      OR: [
        ...(hint.sku ? [{ sku: hint.sku }] : []),
        ...(hint.externalIds
          ? Object.entries(hint.externalIds).map(([prov, ext]) => ({
              provider: prov,
              providerProductId: ext,
            }))
          : []),
      ],
    },
    take: 500, // bounded — large stores will iterate
  });

  if (unmapped.length === 0) {
    return { resolved, failed };
  }

  for (const item of unmapped) {
    try {
      const mapping = await tryMapping(storeId, item.provider, {
        sku:               item.sku ?? undefined,
        providerProductId: item.providerProductId ?? undefined,
        productName:       item.productName ?? undefined,
      });
      if (!mapping) continue;
      if (hint.productId && mapping.productId !== hint.productId) continue;

      await prisma.providerOrderItem.update({
        where: { id: item.id },
        data: {
  productId: mapping.productId,
  status: "MAPPED",
  matchedBy: mapping.matchedBy,
  confidenceScore: new Decimal(mapping.confidenceScore),
  mappedAt: new Date(),
},
      });

      if (item.orderId) {
        await mirrorOrderItem(item.orderId, mapping.productId, item.id, {
          quantity:  Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount:  Number(item.discount),
        }).catch(() => {
          // Mirror failure is non-fatal; the ProviderOrderItem is still marked MAPPED
          // and a re-run can recreate the OrderItem.
        });
      }

      resolved++;
    } catch (err) {
      logger.warn("Resolution failed for item", {
        metadata: { itemId: item.id, error: String(err) },
      });
      failed++;
    }
  }

  if (resolved > 0 || failed > 0) {
    logger.info("Resolution batch complete", {
      metadata: { storeId, resolved, failed, hint },
    });
  }

  return { resolved, failed };
}

/**
 * Create or update the mirror OrderItem row (so analytics queries can use the
 * standard OrderItem joins without going through ProviderOrderItem).
 */
async function mirrorOrderItem(
  orderId:   string,
  productId: string,
  _providerItemId: string,
  values:    { quantity: number; unitPrice: number; discount: number },
) {
  const existing = await prisma.orderItem.findFirst({
    where:  { orderId, productId },
    select: { id: true },
  });

  const quantity = isFinite(values.quantity) ? values.quantity : 0;
const unitPrice = isFinite(values.unitPrice) ? values.unitPrice : 0;
const discount = isFinite(values.discount) ? values.discount : 0;

if (existing) {
  const current = await prisma.orderItem.findUnique({
    where: { id: existing.id },
    select: { quantity: true, discount: true },
  });

  await prisma.orderItem.update({
    where: { id: existing.id },
    data: {
      quantity: new Decimal(Number(current?.quantity ?? 0) + quantity),
      unitPrice: new Decimal(unitPrice),
      discount: new Decimal(Number(current?.discount ?? 0) + discount),
    },
  });
} else {
  await prisma.orderItem.create({
    data: {
      orderId,
      productId,
      quantity: new Decimal(quantity),
      unitPrice: new Decimal(unitPrice),
      discount: new Decimal(discount),
    },
  });
}
}

/** List unmapped items — used by future UI for manual mapping */
export async function listUnmappedItems(storeId: string, limit = 100) {
  return prisma.providerOrderItem.findMany({
    where:   { storeId, status: "UNMAPPED" },
    orderBy: { importedAt: "desc" },
    take:    limit,
  });
}
