/**
 * Operational KPI calculations.
 * Repository: 010_ANALYTICS_ENGINE.md — SHIPPING ANALYTICS
 *             003_DATA_DICTIONARY.md — Terms 041–043 (Delivery/Return/Refusal Rate)
 *             034_KPI_CATALOG.md — OPS-001 through OPS-005
 *
 * RULES:
 *  • Pure functions — no DB access, no side effects
 *  • Every function names its KPI ID and formula ID (034)
 *  • "Analytics never changes KPI definitions." (010)
 *  • Formulas not yet in 033 are labeled with their OPS-xxx placeholder IDs
 *  • Rates are returned as Decimal ratios (0.0–1.0); presentation layer converts to %
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { OperationalRateInput, KpiValue } from "../domain/analytics.types";
import { KPI_IDS } from "../domain/analytics.types";

// ── OPS-001: Delivery Rate ─────────────────────────────────────────────────
// "Delivery Rate = Delivered Orders / Total Shipped Orders" (003 Term 041)
// Denominator: orders that have been shipped (excludes PENDING, CONFIRMED, CANCELLED)

export function calculateDeliveryRate(input: OperationalRateInput): KpiValue {
  const denominator = input.totalShippedOrders;
  const rate = denominator === 0
    ? new Decimal(0)
    : new Decimal(input.deliveredOrders).dividedBy(new Decimal(denominator));

  return {
    kpiId: KPI_IDS.DELIVERY_RATE,
    storeId: input.storeId,
    value: rate,
    periodStart: input.range.from,
    periodEnd: input.range.to,
    computedAt: new Date(),
    formulaId: "OPS-001",
    formulaVersion: "1.0.0",
  };
}

// ── OPS-002: Return Rate ───────────────────────────────────────────────────
// "Return Rate = Returned Orders / Delivered Orders" (003 Term 042)
// Denominator: delivered orders (returns can only follow delivery)

export function calculateReturnRate(input: OperationalRateInput): KpiValue {
  const denominator = input.deliveredOrders;
  const rate = denominator === 0
    ? new Decimal(0)
    : new Decimal(input.returnedOrders).dividedBy(new Decimal(denominator));

  return {
    kpiId: KPI_IDS.RETURN_RATE,
    storeId: input.storeId,
    value: rate,
    periodStart: input.range.from,
    periodEnd: input.range.to,
    computedAt: new Date(),
    formulaId: "OPS-002",
    formulaVersion: "1.0.0",
  };
}

// ── OPS-003: Refusal Rate ─────────────────────────────────────────────────
// "Refusal Rate = Refused Orders / Total Shipped Orders" (003 Term 043)
// "Refusal Rate is different from Return Rate." (003 Term 043)
// Refused = customer declines at doorstep before delivery is completed

export function calculateRefusalRate(input: OperationalRateInput): KpiValue {
  const denominator = input.totalShippedOrders;
  const rate = denominator === 0
    ? new Decimal(0)
    : new Decimal(input.refusedOrders).dividedBy(new Decimal(denominator));

  return {
    kpiId: KPI_IDS.REFUSAL_RATE,
    storeId: input.storeId,
    value: rate,
    periodStart: input.range.from,
    periodEnd: input.range.to,
    computedAt: new Date(),
    formulaId: "OPS-003",
    formulaVersion: "1.0.0",
  };
}

// ── OPS-004: Exchange Rate ────────────────────────────────────────────────
// Exchange Rate = Exchange Orders / Total Shipped Orders

export function calculateExchangeRate(input: OperationalRateInput): KpiValue {
  const denominator = input.totalShippedOrders;
  const rate = denominator === 0
    ? new Decimal(0)
    : new Decimal(input.exchangedOrders).dividedBy(new Decimal(denominator));

  return {
    kpiId: KPI_IDS.EXCHANGE_RATE,
    storeId: input.storeId,
    value: rate,
    periodStart: input.range.from,
    periodEnd: input.range.to,
    computedAt: new Date(),
    formulaId: "OPS-004",
    formulaVersion: "1.0.0",
  };
}

// ── OPS-005: Average Order Value ──────────────────────────────────────────
// AOV = Total Revenue / Delivered Orders

export function calculateAverageOrderValue(
  totalRevenue: Decimal,
  deliveredOrders: number,
  storeId: string,
  range: { from: Date; to: Date },
): KpiValue {
  const aov = deliveredOrders === 0
    ? new Decimal(0)
    : totalRevenue.dividedBy(new Decimal(deliveredOrders));

  return {
    kpiId: KPI_IDS.AVG_ORDER_VALUE,
    storeId,
    value: aov,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: "OPS-005",
    formulaVersion: "1.0.0",
  };
}

// ── Batch: all operational rates ──────────────────────────────────────────

export function calculateAllOperationalRates(input: OperationalRateInput): {
  deliveryRate: KpiValue;
  returnRate: KpiValue;
  refusalRate: KpiValue;
  exchangeRate: KpiValue;
} {
  return {
    deliveryRate: calculateDeliveryRate(input),
    returnRate: calculateReturnRate(input),
    refusalRate: calculateRefusalRate(input),
    exchangeRate: calculateExchangeRate(input),
  };
}
