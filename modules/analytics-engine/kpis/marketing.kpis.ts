/**
 * Marketing KPI calculations.
 * Repository: 010_ANALYTICS_ENGINE.md — MARKETING ANALYTICS, CAMPAIGN ANALYTICS
 *             007_FINANCIAL_ENGINE.md — TRUE CPA
 *             034_KPI_CATALOG.md — KPI-MKT-001 through KPI-MKT-003
 *
 * "Marketing Analytics consume Marketing Engine and Financial Engine outputs." (010)
 * "True CPA is calculated only by the Financial Engine." (007)
 * NOTE: True CPA computation occurs here in Analytics per the pipeline (010: Analytics → Dashboard),
 * consuming Financial Engine outputs (revenue events, delivered order counts). (007)
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { KpiValue, MarketingAnalyticsSummary, DateRange } from "../domain/analytics.types";
import { KPI_IDS } from "../domain/analytics.types";

// ── MKT-002: True CPA ─────────────────────────────────────────────────────
// True CPA = Marketing Spend / Delivered Orders (007: TRUE CPA)
// "Real acquisition cost required to generate one delivered order."

export function calculateTrueCpa(
  marketingSpend: Decimal,
  deliveredOrders: number,
  storeId: string,
  range: DateRange,
): KpiValue {
  const trueCpa = deliveredOrders === 0
    ? new Decimal(0)
    : marketingSpend.dividedBy(new Decimal(deliveredOrders));

  return {
    kpiId: KPI_IDS.TRUE_CPA,
    storeId,
    value: trueCpa,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: "MKT-002",
    formulaVersion: "1.0.0",
  };
}

// ── MKT-003: Marketing ROI ────────────────────────────────────────────────
// ROI = (Revenue − Marketing Spend) / Marketing Spend

export function calculateMarketingRoi(
  revenue: Decimal,
  marketingSpend: Decimal,
  storeId: string,
  range: DateRange,
): KpiValue {
  const roi = marketingSpend.isZero()
    ? new Decimal(0)
    : revenue.minus(marketingSpend).dividedBy(marketingSpend);

  return {
    kpiId: KPI_IDS.MARKETING_ROI,
    storeId,
    value: roi,
    periodStart: range.from,
    periodEnd: range.to,
    computedAt: new Date(),
    formulaId: "MKT-003",
    formulaVersion: "1.0.0",
  };
}

// ── Marketing summary builder ─────────────────────────────────────────────

export function buildMarketingAnalyticsSummary(params: {
  storeId: string;
  range: DateRange;
  platform: string;
  totalSpend: Decimal;
  totalRevenue: Decimal;
  deliveredOrders: number;
}): MarketingAnalyticsSummary {
  const trueCpa = params.deliveredOrders === 0
    ? new Decimal(0)
    : params.totalSpend.dividedBy(params.deliveredOrders);

  const roi = params.totalSpend.isZero()
    ? new Decimal(0)
    : params.totalRevenue.minus(params.totalSpend).dividedBy(params.totalSpend);

  return {
    storeId: params.storeId,
    range: params.range,
    platform: params.platform,
    totalSpend: params.totalSpend,
    totalRevenue: params.totalRevenue,
    deliveredOrders: params.deliveredOrders,
    trueCpa,
    roi,
  };
}
