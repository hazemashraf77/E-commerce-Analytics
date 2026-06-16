/**
 * Formula Engine — public API.
 * Repository: 068_FORMULA_ENGINE.md, 033_FORMULA_CATALOG.md
 */

// Registry
export { FORMULA_REGISTRY, getFormula, getFormulasByDomain, ALL_FORMULA_IDS,
         FINANCIAL_FORMULA_IDS, MARKETING_FORMULA_IDS, SHIPPING_FORMULA_IDS, INVENTORY_FORMULA_IDS,
} from "./domain/formula.registry";
export type { FormulaDefinition, FormulaDomain, FormulaOwner } from "./domain/formula.registry";

// KPI Calculator
export {
  calcRevenue, calcGrossProfit, calcNetProfit, calcTrueProfit,
  calcContributionMargin, calcProfitMarginPct, calcProfitLeakage,
  calcAdvertisingCpa, calcConfirmedCpa, calcShippedCpa, calcDeliveredCpa, calcTrueCpa,
  calcPlatformRoas, calcDeliveredRoas, calcTrueRoas, calcPpap,
  calcDeliveryRate, calcReturnRate, calcRefusalRate, calcExchangeRate,
  calcTrueShippingCost, calcShippingCostPerOrder,
  calcInventoryValue, calcInventoryVelocity, calcDaysRemaining,
  calcCashLocked, calcInventoryRoi, classifyInventoryStatus,
  calcHealthScores, toDimensional,
} from "./application/kpi.calculator";
export type {
  DimensionalValue, ProductKpiRow, FinancialKpis, MarketingKpis,
  ShippingKpis, InventoryKpis, HealthScores,
} from "./application/kpi.calculator";

// Mock data
export { MOCK_PRODUCT_INTELLIGENCE } from "./domain/mock-product-intelligence";
