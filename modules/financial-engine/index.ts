/**
 * Financial Engine — public API barrel.
 * Repository: 007_FINANCIAL_ENGINE.md — FINANCIAL ENGINE OBJECTIVES
 * "No dashboard, API adapter, database query, AI module or report may
 *  calculate financial values independently." (007)
 */

// Types
export type {
  OrderFinancialInput,
  OrderItemFinancialInput,
  FinancialAdjustmentInput,
  RevenueResult,
  GrossProfitResult,
  ShippingSubsidyResult,
  NetProfitResult,
  ProfitContributionResult,
  OrderFinancialResult,
  FormulaInspectorTrace,
  FormulaId,
} from "./domain/financial.types";
export { FORMULA_IDS, REVENUE_RECOGNITION_TRIGGER } from "./domain/financial.types";

// Formulas (exposed for Formula Engine integration — Sprint 5)
export {
  calculateRevenue,
  calculateShippingSubsidy,
  calculateGrossProfit,
  calculateNetProfit,
  calculateProfitContributions,
  calculateCogs,
} from "./formulas/financial.formulas";

// Formula Inspector
export {
  traceRevenue,
  traceShippingSubsidy,
  traceGrossProfit,
  traceNetProfit,
  traceProfitContribution,
} from "./domain/formula.inspector";

// Validation
export {
  assertDeliveredStatus,
  assertFinancialInputComplete,
  assertShippingFieldsSeparate,
  assertAtMostOneCampaignProduct,
} from "./domain/financial.validation";

// Service
export { processDeliveredOrder, registerInventoryEventHandlers } from "./application/financial.engine";

// Repository (read access for Analytics Engine)
export { hasRevenueEvent } from "./repositories/financial-event.repository";
