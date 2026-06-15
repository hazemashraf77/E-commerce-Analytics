/**
 * Analytics Engine — public API barrel.
 * Repository: 010_ANALYTICS_ENGINE.md
 * "Business calculations remain outside the Analytics Engine." (010)
 */

// Types
export type {
  KpiId,
  KpiCategory,
  KpiDefinition,
  KpiValue,
  TimeSeriesPoint,
  TrendResult,
  AnalyticsPeriod,
  DateRange,
  OperationalRateInput,
  FinancialAnalyticsSummary,
  MarketingAnalyticsSummary,
  InventoryAnalyticsSummary,
  DailySnapshotInput,
} from "./domain/analytics.types";
export { KPI_IDS } from "./domain/analytics.types";

// Operational counts foundation (Order vs Item duality — Improvement 2)
export type {
  OrderOperationalCounts,
  ItemOperationalCounts,
  FullOperationalInput,
} from "./domain/operational-counts.types";
export { FUTURE_ITEM_KPI_IDS } from "./domain/operational-counts.types";

// KPI Registry
export { KPI_REGISTRY, getKpiDefinition, assertKpiExists } from "./domain/kpi.registry";

// Operational KPIs
export {
  calculateDeliveryRate,
  calculateReturnRate,
  calculateRefusalRate,
  calculateExchangeRate,
  calculateAverageOrderValue,
  calculateAllOperationalRates,
} from "./kpis/operational.kpis";

// Marketing KPIs
export {
  calculateTrueCpa,
  calculateMarketingRoi,
  buildMarketingAnalyticsSummary,
} from "./kpis/marketing.kpis";

// Financial analytics
export {
  calculateProfitMargin,
  buildFinancialAnalyticsSummary,
  wrapRevenueKpi,
  wrapGrossProfitKpi,
  wrapNetProfitKpi,
  wrapShippingSubsidyKpi,
} from "./kpis/financial.analytics";

// Inventory analytics
export {
  calculateInventoryValue,
  calculateInventoryTurnover,
  calculateDaysOfInventory,
  wrapInventoryValueKpi,
  buildInventoryAnalyticsSummary,
} from "./kpis/inventory.analytics";

// Trend service
export {
  detectTrendDirection,
  calculatePeriodChange,
  buildTrendResult,
  calculateMovingAverage,
  buildTimeSeriesFromSnapshots,
} from "./services/trend.service";

// Snapshot service
export {
  createDailySnapshot,
  getSnapshotsForRange,
  getLatestSnapshot,
  aggregateSnapshotRange,
} from "./snapshots/daily-snapshot.service";

// Repository
export { resolveDateRange } from "./repositories/analytics-read.repository";

// Engine
export {
  computeExecutiveKpiDataset,
  getKpiFromDataset,
} from "./application/analytics.engine";
export type { ExecutiveKpiDataset } from "./application/analytics.engine";
