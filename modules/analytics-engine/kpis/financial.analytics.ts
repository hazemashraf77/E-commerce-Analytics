/**
 * Financial analytics KPI computations.
 * Repository: 010_ANALYTICS_ENGINE.md — FINANCIAL ANALYTICS
 *             007_FINANCIAL_ENGINE.md — source of all financial values
 *
 * RULE: "Financial Analytics never redefine financial formulas." (010)
 * All monetary values are READ from Financial Engine event tables.
 * This layer AGGREGATES only — it never recalculates revenue, profit, or COGS.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { KpiValue, FinancialAnalyticsSummary, DateRange } from "../domain/analytics.types";
import { KPI_IDS } from "../domain/analytics.types";
import { FORMULA_IDS } from "@/modules/financial-engine";

// ── Profit Margin (derived from Net Profit / Revenue) ─────────────────────
// Not a new formula — ratio of two Financial Engine outputs

export function calculateProfitMargin(
  netProfit: Decimal,
  revenue: Decimal,
  storeId: string,
  range: DateRange,
): KpiValue {
  const margin = revenue.isZero()
    ? new Decimal(0)
    : netProfit.dividedBy(revenue);

  return {
    kpiId: KPI_IDS.PROFIT_MARGIN,
    storeId,
    value: margin,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: FORMULA_IDS.NET_PROFIT,   // derived from FIN-002 outputs
    formulaVersion: "1.0.0",
  };
}

// ── Financial summary builder ─────────────────────────────────────────────

export function buildFinancialAnalyticsSummary(params: {
  storeId: string;
  range: DateRange;
  totalRevenue: Decimal;
  totalGrossProfit: Decimal;
  totalNetProfit: Decimal;
  totalShippingExpense: Decimal;
  totalShippingSubsidy: Decimal;
  totalMarketingExpense: Decimal;
  deliveredOrderCount: number;
}): FinancialAnalyticsSummary {
  const avgOrderValue = params.deliveredOrderCount === 0
    ? new Decimal(0)
    : params.totalRevenue.dividedBy(params.deliveredOrderCount);

  const profitMargin = params.totalRevenue.isZero()
    ? new Decimal(0)
    : params.totalNetProfit.dividedBy(params.totalRevenue);

  return {
    ...params,
    avgOrderValue,
    profitMargin,
  };
}

// ── Revenue KPI value wrapper ──────────────────────────────────────────────

export function wrapRevenueKpi(
  totalRevenue: Decimal,
  storeId: string,
  range: DateRange,
): KpiValue {
  return {
    kpiId: KPI_IDS.REVENUE,
    storeId,
    value: totalRevenue,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: FORMULA_IDS.REVENUE,
    formulaVersion: "1.0.0",
  };
}

export function wrapGrossProfitKpi(v: Decimal, storeId: string, range: DateRange): KpiValue {
  return { kpiId: KPI_IDS.GROSS_PROFIT, storeId, value: v, periodStart: range.from, periodEnd: range.to, computedAt: new Date(), formulaId: FORMULA_IDS.GROSS_PROFIT, formulaVersion: "1.0.0" };
}

export function wrapNetProfitKpi(v: Decimal, storeId: string, range: DateRange): KpiValue {
  return { kpiId: KPI_IDS.NET_PROFIT, storeId, value: v, periodStart: range.from, periodEnd: range.to, computedAt: new Date(), formulaId: FORMULA_IDS.NET_PROFIT, formulaVersion: "1.0.0" };
}

export function wrapShippingSubsidyKpi(v: Decimal, storeId: string, range: DateRange): KpiValue {
  return { kpiId: KPI_IDS.SHIPPING_SUBSIDY, storeId, value: v, periodStart: range.from, periodEnd: range.to, computedAt: new Date(), formulaId: FORMULA_IDS.SHIPPING_SUBSIDY, formulaVersion: "1.0.0" };
}
