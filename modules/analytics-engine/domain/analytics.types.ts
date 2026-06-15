/**
 * Analytics Engine domain types.
 * Repository: 010_ANALYTICS_ENGINE.md — all KPI definitions
 *             034_KPI_CATALOG.md — KPI structure, categories, formula references
 *             004_CANONICAL_DATA_MODEL.md — Entity 020 (KPI), Entity 024 (Daily Snapshot)
 *
 * RULE: "Analytics never changes KPI definitions." (010)
 * RULE: "Every KPI shall reference exactly one Formula." (034)
 */

import type { Decimal } from "@prisma/client/runtime/library";

// ── KPI IDs ────────────────────────────────────────────────────────────────
// Permanent identifiers per 034_KPI_CATALOG — "KPI IDs are permanent"

export const KPI_IDS = {
  // Financial (consume Financial Engine outputs only)
  REVENUE: "KPI-FIN-001",
  GROSS_PROFIT: "KPI-FIN-002",
  NET_PROFIT: "KPI-FIN-003",
  PROFIT_MARGIN: "KPI-FIN-004",
  SHIPPING_SUBSIDY: "KPI-FIN-005",
  // Operational (shipping/delivery)
  DELIVERY_RATE: "KPI-OPS-001",
  RETURN_RATE: "KPI-OPS-002",
  REFUSAL_RATE: "KPI-OPS-003",
  EXCHANGE_RATE: "KPI-OPS-004",
  AVG_ORDER_VALUE: "KPI-OPS-005",
  // Marketing
  MARKETING_SPEND: "KPI-MKT-001",
  TRUE_CPA: "KPI-MKT-002",
  MARKETING_ROI: "KPI-MKT-003",
  // Inventory
  INVENTORY_VALUE: "KPI-INV-001",
  INVENTORY_TURNOVER: "KPI-INV-002",
  DAYS_OF_INVENTORY: "KPI-INV-003",
} as const;

export type KpiId = (typeof KPI_IDS)[keyof typeof KPI_IDS];

// ── KPI category per 034 ──────────────────────────────────────────────────

export type KpiCategory =
  | "FINANCIAL"
  | "OPERATIONAL"
  | "MARKETING"
  | "INVENTORY"
  | "CASH_FLOW"
  | "AI"
  | "EXECUTIVE";

// ── KPI registry entry (034: KPI IDENTIFIER template) ────────────────────

export interface KpiDefinition {
  kpiId: KpiId;
  kpiName: string;
  nameAr: string;         // 020_ACCEPTANCE_CRITERIA: bilingual required
  category: KpiCategory;
  formulaId: string;      // references 033_FORMULA_CATALOG — "every KPI → one formula" (034)
  formulaVersion: string;
  unit: "CURRENCY" | "PERCENT" | "COUNT" | "DAYS" | "RATIO";
  owner: string;
  refreshFrequency: "REAL_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
  description: string;
  sourceEngine: "FINANCIAL_ENGINE" | "INVENTORY_ENGINE" | "SYNC_ENGINE" | "ANALYTICS_ENGINE";
}

// ── KPI value (computed result) ───────────────────────────────────────────

export interface KpiValue {
  kpiId: KpiId;
  storeId: string;
  value: Decimal;
  periodStart: Date;
  periodEnd: Date;
  computedAt: Date;
  formulaId: string;
  formulaVersion: string;
}

// ── Time-series point (010: TREND ANALYSIS) ───────────────────────────────

export interface TimeSeriesPoint {
  date: Date;
  value: Decimal;
  kpiId: KpiId;
}

export interface TrendResult {
  kpiId: KpiId;
  direction: "UP" | "DOWN" | "FLAT";
  changeAbsolute: Decimal;
  changePercent: Decimal;
  dataPoints: TimeSeriesPoint[];
  periodStart: Date;
  periodEnd: Date;
}

// ── Analytics period filter (010: HISTORICAL ANALYSIS) ────────────────────

export type AnalyticsPeriod =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "LAST_QUARTER"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "CUSTOM";

export interface DateRange {
  from: Date;
  to: Date;
}

// ── Operational rate input (010: SHIPPING ANALYTICS) ─────────────────────

export interface OperationalRateInput {
  storeId: string;
  range: DateRange;
  /** Orders that entered the shipping pipeline (SHIPPED+). Denominator for Delivery/Refusal/Exchange Rate (003 Terms 041-043). */
  totalShippedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  refusedOrders: number;
  exchangedOrders: number;
}

// ── Financial analytics summary ───────────────────────────────────────────

export interface FinancialAnalyticsSummary {
  storeId: string;
  range: DateRange;
  totalRevenue: Decimal;
  totalGrossProfit: Decimal;
  totalNetProfit: Decimal;
  totalShippingExpense: Decimal;
  totalShippingSubsidy: Decimal;
  totalMarketingExpense: Decimal;
  deliveredOrderCount: number;
  avgOrderValue: Decimal;
  profitMargin: Decimal;
}

// ── Marketing analytics summary ───────────────────────────────────────────

export interface MarketingAnalyticsSummary {
  storeId: string;
  range: DateRange;
  platform: string;
  totalSpend: Decimal;
  totalRevenue: Decimal;
  deliveredOrders: number;
  trueCpa: Decimal;        // KPI-MKT-002: spend / deliveredOrders
  roi: Decimal;            // KPI-MKT-003: (revenue - spend) / spend
}

// ── Inventory analytics summary ───────────────────────────────────────────

export interface InventoryAnalyticsSummary {
  storeId: string;
  asOf: Date;
  totalInventoryValue: Decimal;  // Σ (remainingQty × unitCost) — from Inventory Engine
  activeLayers: number;
  lowStockProductCount: number;
  outOfStockProductCount: number;
  deadStockValue: Decimal;
}

// ── Daily snapshot input (010: DAILY SNAPSHOTS) ───────────────────────────

export interface DailySnapshotInput {
  storeId: string;
  snapshotDate: Date;
  revenue: Decimal;
  grossProfit: Decimal;
  netProfit: Decimal;
  cashPosition: Decimal;
  inventoryValue: Decimal;
  marketingSpend: Decimal;
  deliveryRate: Decimal;
  returnRate: Decimal;
  /** Orders that entered the shipping pipeline (SHIPPED+). Denominator for Delivery/Refusal/Exchange Rate (003 Terms 041-043). */
  totalShippedOrders: number;
  deliveredOrders: number;
}
