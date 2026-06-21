/**
 * GET /api/v1/products/performance
 *
 * Sprint 2A — backend skeleton. Sprint 2B uses this to power the homepage product table.
 *
 * Returns per-product performance: orders, units sold, revenue, cost, gross profit.
 * All values from DB — no fake numbers.
 *
 * Query params:
 *   storeId   — required
 *   from, to  — ISO dates (default: last 30 days)
 *   status    — Product status filter (default: ACTIVE)
 */

import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/db/prisma";
import type { ProductPerformanceResponseDTO } from "@/types/product-performance";
import {
  isDeliveredShipmentStatus,
  isReturnedShipmentStatus,
} from "@/constants/shipment-status";

const Schema = z.object({
  storeId: StoreIdSchema,
  from:    z.string().datetime().optional(),
  to:      z.string().datetime().optional(),
  status:  z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return validationError("Invalid query", { issues: parsed.error.issues });
  }
  const { storeId, status } = parsed.data;
  const from = parsed.data.from ? new Date(parsed.data.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to   = parsed.data.to   ? new Date(parsed.data.to)   : new Date();

  // Load all products in scope
  const products = await prisma.product.findMany({
    where: { storeId, status, isDeleted: false },
    select: {
      id: true, sku: true, name: true, category: true, imageUrl: true,
      defaultSellingPrice: true, unitProductCost: true, packagingCost: true,
      minimumStockThreshold: true,
    },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    return ok({ from: from.toISOString(), to: to.toISOString(), products: [] }, { requestId: auth.requestId });
  }

  // Bulk-load OrderItem aggregates per product within date range
  // We can't groupBy with date filter easily in Prisma, so do raw join via findMany
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: products.map((p) => p.id) },
      order: {
        storeId,
        orderDate: { gte: from, lte: to },
      },
    },
    select: {
      productId:        true,
      quantity:         true,
      unitPrice:        true,
      discount:         true,
      fifoCost:         true,
      allocatedRevenue: true,
      order: { select: { id: true, orderStatus: true, shipmentStatus: true } },
    },
  });

  // Aggregate per product
  type Agg = {
    orderIds:           Set<string>;
    unitsSold:          number;
    deliveredUnits:     number;
    returnedUnits:      number;
    grossRevenue:       number;
    discounts:          number;
    realisedRevenue:    number;        // delivered only
    realisedFifoCost:   number;        // delivered only
  };
  const aggMap = new Map<string, Agg>();

  for (const p of products) {
    aggMap.set(p.id, {
      orderIds:         new Set(),
      unitsSold:        0,
      deliveredUnits:   0,
      returnedUnits:    0,
      grossRevenue:     0,
      discounts:        0,
      realisedRevenue:  0,
      realisedFifoCost: 0,
    });
  }

  for (const item of orderItems) {
    const a = aggMap.get(item.productId)!;
    const qty   = Number(item.quantity);
    const price = Number(item.unitPrice);
    const disc  = Number(item.discount);
    const lineRevenue = qty * price - disc;

    a.orderIds.add(item.order.id);
    a.unitsSold     += qty;
    a.grossRevenue  += lineRevenue;
    a.discounts     += disc;

    const isDelivered =
  item.order.orderStatus === "DELIVERED" ||
  isDeliveredShipmentStatus(item.order.shipmentStatus);

const isReturned =
  isReturnedShipmentStatus(item.order.shipmentStatus) ||
  item.order.orderStatus === "CANCELLED";

    if (isDelivered) {
      a.deliveredUnits   += qty;
      a.realisedRevenue  += Number(item.allocatedRevenue ?? lineRevenue);
      a.realisedFifoCost += Number(item.fifoCost ?? 0);
    }
    if (isReturned) {
      a.returnedUnits += qty;
    }
  }

  // Build response rows
  const rows = products.map((p) => {
    const a = aggMap.get(p.id)!;
    const unitCost   = p.unitProductCost ? Number(p.unitProductCost) : 0;
    const packCost   = Number(p.packagingCost ?? 0);
    const baseCost   = (unitCost + packCost) * a.deliveredUnits;
    const finalCost  = a.realisedFifoCost > 0 ? a.realisedFifoCost : baseCost;
    const grossProfit = a.realisedRevenue - finalCost;
    const margin      = a.realisedRevenue > 0 ? (grossProfit / a.realisedRevenue) * 100 : 0;

    return {
      productId:        p.id,
      sku:              p.sku,
      name:             p.name,
      category:         p.category,
      imageUrl:         p.imageUrl,
      sellingPrice:     Number(p.defaultSellingPrice),
      // Counts
      orderCount:       a.orderIds.size,
      unitsSold:        a.unitsSold,
      deliveredUnits:   a.deliveredUnits,
      returnedUnits:    a.returnedUnits,
      // Money
      grossRevenue:     round2(a.grossRevenue),
      discounts:        round2(a.discounts),
      realisedRevenue:  round2(a.realisedRevenue),
      cogs:             round2(finalCost),
      grossProfit:      round2(grossProfit),
      marginPct:        round2(margin),
      // Cost source flag
      costSource:       a.realisedFifoCost > 0 ? "FIFO" : "DEFAULT",
    };
  });

  const response: ProductPerformanceResponseDTO = {
  from: from.toISOString(),
  to: to.toISOString(),
  productCount: products.length,
  products: rows.map((row) => ({
    product: {
      productId: row.productId,
      sku: row.sku,
      name: row.name,
      category: row.category,
      imageUrl: row.imageUrl,
    },
    orders: {
      orderCount: row.orderCount,
      unitsSold: row.unitsSold,
      confirmedOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
      cancelledOrders: 0,
      deliveredUnits: row.deliveredUnits,
      returnedUnits: row.returnedUnits,
    },
    financial: {
      grossRevenue: row.grossRevenue,
      realisedRevenue: row.realisedRevenue,
      projectedRevenue: row.grossRevenue,
      discounts: row.discounts,
      cogs: row.cogs,
      packagingCost: 0,
      estimatedShippingCost: 0,
      totalCost: row.cogs,
      grossProfit: row.grossProfit,
      netProfit: row.grossProfit,
      projectedProfit: row.grossProfit,
      marginPct: row.marginPct,
      profitPerOrder: row.orderCount > 0 ? round2(row.grossProfit / row.orderCount) : 0,
      profitPerUnit: row.deliveredUnits > 0 ? round2(row.grossProfit / row.deliveredUnits) : 0,
      costSource: row.costSource,
    },
    inventory: {
      physicalQuantity: 0,
      reservedQuantity: 0,
      incomingQuantity: 0,
      damagedQuantity: 0,
      returnedQuantity: 0,
      availableQuantity: 0,
      minimumStockThreshold: 0,
      maximumStockThreshold: null,
      reorderPoint: null,
      reorderQuantity: null,
      inventoryValue: 0,
      stockHealth: "UNKNOWN",
    },
    shipping: {
      deliveredUnits: row.deliveredUnits,
      returnedUnits: row.returnedUnits,
      deliveryRate: row.unitsSold > 0 ? round2((row.deliveredUnits / row.unitsSold) * 100) : 0,
      returnRate: row.unitsSold > 0 ? round2((row.returnedUnits / row.unitsSold) * 100) : 0,
      averageShippingCost: 0,
    },
    marketing: {
      META: emptyMarketing(),
      TIKTOK: emptyMarketing(),
      BLENDED: emptyMarketing(),
    },
    aov: {
      overallAOV: row.orderCount > 0 ? round2(row.grossRevenue / row.orderCount) : 0,
      deliveredAOV: row.orderCount > 0 ? round2(row.realisedRevenue / row.orderCount) : 0,
      averagePiecesPerOrder: row.orderCount > 0 ? round2(row.unitsSold / row.orderCount) : 0,
      averageProductsPerOrder: 0,
      dominantBucketLabel: null,
      dominantBucketAverage: null,
      suggestedOfferThreshold: null,
    },
    scores: {
      profitScore: scoreProfit(row.marginPct),
      marketingScore: 50,
      inventoryScore: 50,
      shippingScore: 50,
      overallScore: scoreProfit(row.marginPct),
    },
    recommendations: [],
  })),
};

return ok(response, { requestId: auth.requestId });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function emptyMarketing() {
  return {
    spend: 0,
    orders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    revenue: 0,
    cpa: 0,
    trueCpa: 0,
    roas: 0,
    trueRoas: 0,
  };
}

function scoreProfit(marginPct: number): number {
  if (marginPct >= 40) return 90;
  if (marginPct >= 25) return 75;
  if (marginPct >= 10) return 55;
  if (marginPct >= 0) return 35;
  return 10;
}

export const GET = withAuth(handler, "READ_ONLY");
