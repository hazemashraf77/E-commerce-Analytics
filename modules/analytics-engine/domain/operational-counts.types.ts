/**
 * Item-level operational count types.
 *
 * Business requirement registered 2026-06-12:
 * "The platform must support both Order Count and Item/Unit Count across all major
 *  operational analytics." (Sprint 5 Improvement 2)
 *
 * Current Sprint 5 KPIs are Order-based (OPS-001 through OPS-005).
 * This module extends the OperationalRateInput foundation so Item-based KPIs
 * can be added alongside Order-based KPIs in a later sprint WITHOUT breaking
 * existing APIs or existing order-level calculations.
 *
 * Design principle: parallel, not replacement.
 *   OrderOperationalCounts  → existing OPS-001–004 denominators (shipped orders)
 *   ItemOperationalCounts   → future OPS-xxx denominators (shipped units)
 *
 * No formulas are defined here. No KPI IDs are assigned yet.
 * This is purely a structural foundation.
 *
 * Repository: 010_ANALYTICS_ENGINE.md — PRODUCT ANALYTICS, SHIPPING ANALYTICS
 *             034_KPI_CATALOG.md — KPI lifecycle (Proposed → Approved → Implemented)
 */

import type { DateRange } from "./analytics.types";

// ── Order-level counts (current Sprint 5 basis) ────────────────────────────

/**
 * Documented operational statuses per the Repository business requirement.
 * These map to shipment/order lifecycle stages (004_CANONICAL_DATA_MODEL, OrderStatus,
 * ShipmentStatus). All downstream KPI calculations read these fields by name.
 */
export interface OrderOperationalCounts {
  storeId: string;
  range: DateRange;
  /** Orders that entered shipping pipeline (SHIPPED+). Denominator: Delivery/Refusal/Exchange Rate. */
  totalShippedOrders: number;
  createdOrders: number;
  confirmedOrders: number;
  sentToShippingOrders: number;    // READY_TO_SHIP
  inTransitOrders: number;
  deliveredOrders: number;
  refusedOrders: number;           // DELIVERY_FAILED
  returningToUsOrders: number;     // EXPECTED_RETURN
  physicallyReturnedOrders: number; // RETURNED
  exchangeOrders: number;
  cancelledOrders: number;
}

// ── Item/Unit-level counts (future sprint — prepared, not implemented) ─────

/**
 * Item-based operational counts mirror the order-based counts above but
 * count individual order line items (units), not orders.
 *
 * STATUS: Registered for future implementation. No KPI IDs assigned yet.
 * RULE: Item KPIs will be ADDED alongside order KPIs, never replacing them.
 *       "Delivery Rate (Orders)" and "Delivery Rate (Items)" are separate KPIs.
 */
export interface ItemOperationalCounts {
  storeId: string;
  range: DateRange;
  totalShippedItems: number;
  createdItems: number;
  confirmedItems: number;
  sentToShippingItems: number;
  inTransitItems: number;
  deliveredItems: number;
  refusedItems: number;
  returningToUsItems: number;
  physicallyReturnedItems: number;
  exchangeItems: number;
  cancelledItems: number;
}

// ── Combined input (for services that compute both dimensions) ─────────────

/**
 * Full operational analytics input containing both order and item counts.
 * The Analytics Engine orchestrator will accept this in a later sprint.
 * Existing functions that accept OperationalRateInput are NOT replaced —
 * they continue to work unchanged via the orderCounts.totalShippedOrders field.
 */
export interface FullOperationalInput {
  orderCounts: OrderOperationalCounts;
  /**
   * Optional until item-level KPIs are implemented. Callers that only supply
   * orderCounts remain fully functional — itemCounts is null until the Item
   * KPI sprint populates it.
   */
  itemCounts: ItemOperationalCounts | null;
}

// ── Future KPI ID reservations (not yet approved in 034_KPI_CATALOG) ──────

/**
 * Placeholder IDs for item-level KPIs pending business owner approval and
 * Formula Catalog entry (CP-003, CP-004). Do NOT use these IDs in calculations
 * until they are formally registered in 034_KPI_CATALOG.
 *
 * Naming convention: KPI-OPS-{sequence}-ITEMS mirrors order KPI pattern.
 */
export const FUTURE_ITEM_KPI_IDS = {
  DELIVERY_RATE_ITEMS:   "KPI-OPS-001-ITEMS",  // future: Delivered Items / Shipped Items
  RETURN_RATE_ITEMS:     "KPI-OPS-002-ITEMS",  // future: Returned Items / Delivered Items
  REFUSAL_RATE_ITEMS:    "KPI-OPS-003-ITEMS",  // future: Refused Items / Shipped Items
  EXCHANGE_RATE_ITEMS:   "KPI-OPS-004-ITEMS",  // future: Exchanged Items / Shipped Items
  REVENUE_PER_ITEM:      "KPI-OPS-006-ITEMS",  // future: Revenue / Delivered Items
  PROFIT_PER_ITEM:       "KPI-OPS-007-ITEMS",  // future: Net Profit / Delivered Items
} as const;

// NOTE: These IDs are reserved. Implementing them requires:
//   1. Business owner approval
//   2. Formula Catalog entries (033)
//   3. KPI Catalog entries (034)
//   4. Analytics Engine orchestrator update
//   Items 1–3 must precede item 4 (CP-003, CP-004).
