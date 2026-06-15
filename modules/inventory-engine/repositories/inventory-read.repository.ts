/**
 * Inventory read repository.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY AVAILABILITY,
 *             PRODUCT STOCK STATUS, LOW STOCK, OUT OF STOCK
 *
 * Read-only queries. No writes. No calculations (ER-001).
 * Available quantity is derived from layer data — never stored separately.
 */

import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { ProductAvailability, StockStatus } from "../domain/inventory.types";
import {
  computeAvailableQuantity,
  deriveStockStatus,
  sortLayersFifo,
} from "../domain/inventory.rules";
import type { FifoLayer } from "../domain/inventory.types";
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_DEAD_STOCK_DAYS,
} from "../domain/inventory.types";
import { differenceInDays } from "date-fns";

// ── Availability ───────────────────────────────────────────────────────────

export async function getProductAvailability(
  productId: string,
  storeId: string,
): Promise<ProductAvailability> {
  const layers = await prisma.inventoryLayer.findMany({
    where: { productId, storeId, isDeleted: false },
    orderBy: { purchaseDate: "asc" },
  });

  const domainLayers = layers as FifoLayer[];
  const available = computeAvailableQuantity(domainLayers);
  const activeLayers = domainLayers.filter((l) => l.remainingQuantity.greaterThan(0)).length;

  const oldestActive = sortLayersFifo(domainLayers.filter((l) => l.remainingQuantity.greaterThan(0)))[0];
  const ageDays = oldestActive
    ? differenceInDays(new Date(), oldestActive.purchaseDate)
    : null;

  // Fetch product's configured thresholds if stored in settings; use defaults otherwise
  const status = deriveStockStatus(
    available,
    new Decimal(DEFAULT_LOW_STOCK_THRESHOLD),
    null,
    ageDays,
    DEFAULT_DEAD_STOCK_DAYS,
  );

  return {
    productId,
    storeId,
    availableQuantity: available,
    activeLayers,
    status,
    asOf: new Date(),
  };
}

/** Bulk availability for all products in a store (dashboard use). */
export async function getAllProductAvailabilities(
  storeId: string,
): Promise<ProductAvailability[]> {
  const rows = await prisma.inventoryLayer.groupBy({
    by: ["productId"],
    where: { storeId, isDeleted: false },
    _sum: { remainingQuantity: true },
    _count: { id: true },
  });

  return rows.map((row) => {
    const available = new Decimal(row._sum.remainingQuantity?.toString() ?? "0");
    const status: StockStatus = available.equals(0) ? "OUT_OF_STOCK" : "IN_STOCK";
    return {
      productId: row.productId,
      storeId,
      availableQuantity: available,
      activeLayers: row._count.id,
      status,
      asOf: new Date(),
    };
  });
}

/** Returns products with OUT_OF_STOCK or LOW_STOCK status (008: LOW STOCK, OUT OF STOCK). */
export async function getLowStockProducts(
  storeId: string,
  lowThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
): Promise<Array<{ productId: string; availableQuantity: Decimal; status: StockStatus }>> {
  const rows = await prisma.inventoryLayer.groupBy({
    by: ["productId"],
    where: { storeId, isDeleted: false },
    _sum: { remainingQuantity: true },
    having: {
      remainingQuantity: { _sum: { lte: lowThreshold } },
    },
  });

  return rows.map((row) => {
    const available = new Decimal(row._sum.remainingQuantity?.toString() ?? "0");
    return {
      productId: row.productId,
      availableQuantity: available,
      status: available.equals(0) ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const),
    };
  });
}

/** FIFO layer count per product — used for Inventory Dashboard metric (008). */
export async function getLayerCountByProduct(
  storeId: string,
): Promise<Record<string, number>> {
  const rows = await prisma.inventoryLayer.groupBy({
    by: ["productId"],
    where: { storeId, isDeleted: false, remainingQuantity: { gt: 0 } },
    _count: { id: true },
  });
  return Object.fromEntries(rows.map((r) => [r.productId, r._count.id]));
}
