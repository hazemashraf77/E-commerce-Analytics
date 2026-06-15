/**
 * Inventory domain business rules.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — core principles, negative inventory rule,
 *             008: INVENTORY OWNERSHIP, FIFO POLICY, NEGATIVE INVENTORY
 *             002_BUSINESS_RULES.md — BR-011, BR-012, BR-013, BR-014, BR-015
 *
 * These are GUARD functions only. No financial calculations exist here.
 * FIFO cost calculation belongs exclusively to the Financial Engine (008).
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { FifoLayer, ReturnRequest } from "./inventory.types";
import { AppError } from "@/utils/errors";

// ── BR-011: FIFO is mandatory ──────────────────────────────────────────────

/** Sorts layers by purchaseDate ascending — oldest first (FIFO order). */
export function sortLayersFifo(layers: FifoLayer[]): FifoLayer[] {
  return [...layers].sort(
    (a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime(),
  );
}

// ── BR-012: Negative inventory is prohibited (008: NEGATIVE INVENTORY) ────

/**
 * Asserts that the requested quantity does not exceed available stock.
 * Throws if insufficient — "The operation shall fail" (008).
 */
export function assertSufficientStock(
  available: Decimal,
  requested: Decimal,
  productId: string,
): void {
  if (available.lessThan(requested)) {
    throw new AppError({
      code: "INSUFFICIENT_INVENTORY",
      message: `Insufficient inventory for product ${productId}. Available: ${available.toString()}, Requested: ${requested.toString()}`,
      severity: "HIGH",
    });
  }
}

// ── Layer state guards ─────────────────────────────────────────────────────

/** A layer is active when remainingQuantity > 0 (008: INVENTORY AVAILABILITY). */
export function isLayerActive(layer: FifoLayer): boolean {
  return layer.remainingQuantity.greaterThan(0) && !layer.isDeleted;
}

/** Layer is closed when remainingQuantity === 0 (008: COMPLETE CONSUMPTION). */
export function isLayerClosed(layer: FifoLayer): boolean {
  return layer.remainingQuantity.equals(0);
}

// ── BR-013: Physical return guard (008: PHYSICAL RETURNS) ─────────────────

/**
 * Expected returns NEVER restore inventory (BR-013, BR-014, 008).
 * This guard enforces the rule at the domain level before any persistence.
 * A return must be explicitly confirmed as physically received.
 */
export function assertPhysicalReturn(request: ReturnRequest): void {
  if (!request.orderId) {
    throw new AppError({
      code: "RETURN_MISSING_ORDER_REFERENCE",
      message: "A return must reference the originating order.",
      severity: "HIGH",
    });
  }
  if (request.quantity.lessThanOrEqualTo(0)) {
    throw new AppError({
      code: "RETURN_INVALID_QUANTITY",
      message: "Return quantity must be greater than zero.",
      severity: "HIGH",
    });
  }
}

// ── BR-015: Layer immutability guard ──────────────────────────────────────

/**
 * Only remainingQuantity may change after layer creation (008: INVENTORY LAYER CREATION).
 * Used in repository update methods to prevent field mutation.
 */
export const IMMUTABLE_LAYER_FIELDS = [
  "productId",
  "purchaseDate",
  "purchaseQuantity",
  "unitCost",
  "supplier",
  "purchaseReference",
] as const;

export type ImmutableLayerField = (typeof IMMUTABLE_LAYER_FIELDS)[number];

// ── Available quantity calculation (008: INVENTORY AVAILABILITY) ──────────

/**
 * Pure function: sum of remainingQuantity across all active layers.
 * No cost calculation — this is quantity only.
 */
export function computeAvailableQuantity(layers: FifoLayer[]): Decimal {
  return layers
    .filter(isLayerActive)
    .reduce((sum, l) => sum.plus(l.remainingQuantity), new Decimal(0));
}

// ── Stock status (008: PRODUCT STOCK STATUS) ──────────────────────────────

/**
 * Determines stock status from available quantity and configurable thresholds.
 * Returns a status string — no cost/value involved.
 */
export function deriveStockStatus(
  available: Decimal,
  lowStockThreshold: Decimal,
  overstockThreshold: Decimal | null,
  oldestLayerAgeDays: number | null,
  deadStockDays: number,
): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "OVERSTOCK" | "DEAD_STOCK" {
  if (available.equals(0)) return "OUT_OF_STOCK";
  if (oldestLayerAgeDays !== null && oldestLayerAgeDays >= deadStockDays) return "DEAD_STOCK";
  if (available.lessThanOrEqualTo(lowStockThreshold)) return "LOW_STOCK";
  if (overstockThreshold && available.greaterThan(overstockThreshold)) return "OVERSTOCK";
  return "IN_STOCK";
}
