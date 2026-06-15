/**
 * Inventory analytics KPI computations.
 * Repository: 010_ANALYTICS_ENGINE.md — INVENTORY ANALYTICS
 *             008_INVENTORY_FIFO_ENGINE.md — source of inventory data
 *
 * "Inventory Analytics consume Inventory Engine outputs only." (010)
 * Inventory value = Σ (remainingQuantity × unitCost) — computed from FIFO layers.
 * No financial formula is redefined here.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { KpiValue, InventoryAnalyticsSummary, DateRange } from "../domain/analytics.types";
import { KPI_IDS } from "../domain/analytics.types";
import type { FifoLayer } from "@/modules/inventory-engine";

// ── INV-002: Inventory Value ──────────────────────────────────────────────
// Σ (remainingQuantity × unitCost) across all active FIFO layers
// Source: Inventory Engine (owns unitCost — 005 SoT)

export function calculateInventoryValue(layers: FifoLayer[]): Decimal {
  return layers
    .filter((l) => l.remainingQuantity.greaterThan(0) && !l.isDeleted)
    .reduce(
      (sum, l) => sum.plus(l.remainingQuantity.times(l.unitCost)),
      new Decimal(0),
    );
}

export function wrapInventoryValueKpi(
  layers: FifoLayer[],
  storeId: string,
  asOf: Date,
): KpiValue {
  const value = calculateInventoryValue(layers);
  return {
    kpiId: KPI_IDS.INVENTORY_VALUE,
    storeId,
    value,
    periodStart: asOf,
    periodEnd: asOf,
    computedAt: new Date(),
    formulaId: "INV-002",
    formulaVersion: "1.0.0",
  };
}

// ── INV-003: Inventory Turnover ───────────────────────────────────────────
// Inventory Turnover = COGS / Average Inventory Value

export function calculateInventoryTurnover(
  cogs: Decimal,
  avgInventoryValue: Decimal,
  storeId: string,
  range: DateRange,
): KpiValue {
  const turnover = avgInventoryValue.isZero()
    ? new Decimal(0)
    : cogs.dividedBy(avgInventoryValue);

  return {
    kpiId: KPI_IDS.INVENTORY_TURNOVER,
    storeId,
    value: turnover,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: "INV-003",
    formulaVersion: "1.0.0",
  };
}

// ── INV-004: Days of Inventory ────────────────────────────────────────────
// Days of Inventory = Average Inventory Value / (COGS / Days in Period)

export function calculateDaysOfInventory(
  avgInventoryValue: Decimal,
  cogs: Decimal,
  daysInPeriod: number,
  storeId: string,
  range: DateRange,
): KpiValue {
  const dailyCogs = daysInPeriod === 0 || cogs.isZero()
    ? new Decimal(0)
    : cogs.dividedBy(daysInPeriod);

  const days = dailyCogs.isZero()
    ? new Decimal(0)
    : avgInventoryValue.dividedBy(dailyCogs);

  return {
    kpiId: KPI_IDS.DAYS_OF_INVENTORY,
    storeId,
    value: days,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: "INV-004",
    formulaVersion: "1.0.0",
  };
}

// ── Inventory analytics summary ───────────────────────────────────────────

export async function buildInventoryAnalyticsSummary(params: {
  storeId: string;
  asOf: Date;
  allLayers: FifoLayer[];
  lowStockProductCount: number;
  outOfStockProductCount: number;
  deadStockLayers: FifoLayer[];
}): Promise<InventoryAnalyticsSummary> {
  const totalInventoryValue = calculateInventoryValue(params.allLayers);
  const deadStockValue = calculateInventoryValue(params.deadStockLayers);

  return {
    storeId: params.storeId,
    asOf: params.asOf,
    totalInventoryValue,
    activeLayers: params.allLayers.filter(
      (l) => l.remainingQuantity.greaterThan(0) && !l.isDeleted,
    ).length,
    lowStockProductCount: params.lowStockProductCount,
    outOfStockProductCount: params.outOfStockProductCount,
    deadStockValue,
  };
}
