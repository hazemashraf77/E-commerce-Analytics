/**
 * Inventory domain types.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md, 004_CANONICAL_DATA_MODEL.md (Entities 007–008),
 *             002_BUSINESS_RULES.md (BR-011–015), 003_DATA_DICTIONARY.md (Terms 005–007)
 *
 * Zero calculations in this file. Types describe structure only.
 */

import type { Decimal } from "@prisma/client/runtime/library";
import type { InventoryMovementType } from "@prisma/client";

// ── FIFO Layer (008: INVENTORY LAYER CREATION, Entity 007) ────────────────

export interface FifoLayer {
  id: string;
  storeId: string;
  productId: string;
  purchaseDate: Date;
  purchaseQuantity: Decimal;
  remainingQuantity: Decimal;      // only mutable field per 008
  unitCost: Decimal;               // immutable after creation (008)
  supplier: string | null;
  purchaseReference: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A layer with zero remaining quantity (008: COMPLETE CONSUMPTION) */
export type ClosedFifoLayer = FifoLayer & { remainingQuantity: Decimal };

// ── Inventory Movement (008: INVENTORY MOVEMENT HISTORY, Entity 008) ──────

export interface InventoryMovement {
  id: string;
  productId: string;
  layerId: string | null;
  movementType: InventoryMovementType;
  quantity: Decimal;
  unitCost: Decimal;
  orderItemId: string | null;
  relatedOrderId: string | null;
  occurredAt: Date;
  createdAt: Date;
  // No updatedAt — immutable (008: history is immutable)
}

// ── Product stock status (008: PRODUCT STOCK STATUS) ──────────────────────

export type StockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "OVERSTOCK"
  | "DEAD_STOCK";

// Thresholds are configurable (008); defaults used by queries
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const DEFAULT_DEAD_STOCK_DAYS = 90;

// ── Inventory availability (008: INVENTORY AVAILABILITY) ──────────────────

/** Read model: available stock for a product at a point in time */
export interface ProductAvailability {
  productId: string;
  storeId: string;
  availableQuantity: Decimal;   // sum of remainingQuantity across active layers
  activeLayers: number;
  status: StockStatus;
  asOf: Date;
}

// ── Layer consumption record (008: FIFO ALLOCATION PROCESS step 5–6) ──────

/**
 * Records which layer was consumed and how much, for full traceability.
 * (008: FIFO TRACEABILITY — "For every sold unit the system shall always know...")
 * Calculation of cost is DELIBERATELY EXCLUDED from this type — belongs to Financial Engine.
 */
export interface LayerConsumptionRecord {
  layerId: string;
  productId: string;
  quantityConsumed: Decimal;
  orderItemId: string;
  orderId: string;
}

// ── Adjustment types (008: INVENTORY ADJUSTMENTS) ─────────────────────────

export type AdjustmentType =
  | "POSITIVE_ADJUSTMENT"
  | "NEGATIVE_ADJUSTMENT"
  | "INVENTORY_CORRECTION"
  | "OPENING_BALANCE_CORRECTION";

// ── Return workflow state (008: PHYSICAL RETURNS) ─────────────────────────

export type ReturnCondition = "GOOD" | "DAMAGED";

export interface ReturnRequest {
  orderId: string;
  productId: string;
  quantity: Decimal;
  originalLayerId: string | null; // restore to original layer if possible (008: FIFO RESTORATION)
  condition: ReturnCondition;
}

// ── Events published by the Inventory Engine ──────────────────────────────

export type InventoryEventType =
  | "LAYER_CREATED"
  | "LAYER_CONSUMED"
  | "LAYER_RESTORED"
  | "LAYER_CLOSED"
  | "MOVEMENT_RECORDED"
  | "STOCK_LOW"
  | "STOCK_DEPLETED"
  | "ADJUSTMENT_APPLIED";

export interface InventoryEvent<T = unknown> {
  type: InventoryEventType;
  productId: string;
  storeId: string;
  occurredAt: Date;
  payload: T;
}
