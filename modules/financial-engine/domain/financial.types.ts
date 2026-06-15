/**
 * Financial Engine domain types.
 * Repository: 007_FINANCIAL_ENGINE.md, 004_CANONICAL_DATA_MODEL.md (Entities 014–017),
 *             002_BUSINESS_RULES.md (BR-005–010), 033_FORMULA_CATALOG v2.1.0
 *
 * Every monetary field uses Decimal(18,4) per 006_DATABASE_SPECIFICATION.md MONEY POLICY.
 * No calculations in this file — types describe structure only.
 */

import type { Decimal } from "@prisma/client/runtime/library";

// ── Formula IDs (033_FORMULA_CATALOG v2.1.0) ─────────────────────────────

export const FORMULA_IDS = {
  GROSS_PROFIT: "FIN-003",
  PROFIT_CONTRIBUTION: "FIN-004",
  // Referenced in 007 but pending full catalog entry — IDs reserved
  REVENUE: "FIN-001",
  FIFO_COST: "INV-001",
  NET_PROFIT: "FIN-002",
  SHIPPING_SUBSIDY: "SHIP-001",
} as const;

export type FormulaId = (typeof FORMULA_IDS)[keyof typeof FORMULA_IDS];

// ── Revenue Recognition (BR-005, 007: REVENUE RECOGNITION) ───────────────

/** Trigger: ShipmentStatus must equal DELIVERED before revenue is recognized. */
export const REVENUE_RECOGNITION_TRIGGER = "DELIVERED" as const;

// ── Order financial inputs (consumed by Financial Engine, not raw API) ────

/**
 * All inputs required to process one delivered order financially.
 * Sourced from Canonical Models only — never from raw provider payloads (007).
 */
export interface OrderFinancialInput {
  orderId: string;
  storeId: string;
  deliveredAt: Date;             // business event timestamp (006: TIMESTAMP POLICY)
  /**
   * The shipping amount charged to the customer, sourced from the Order canonical record
   * (Order.customerShippingFee). This is the agreed fee set at order creation and carried
   * unchanged through delivery — it is NOT recalculated at recognition time.
   * BR-008: independent from actual shipping cost. Term 026: belongs to the sales side.
   * Because revenue recognition only occurs after DELIVERED (BR-005), this value is always
   * associated with a realized transaction — making it a realized fee, not an expected value.
   */
  customerShippingFee: Decimal;
  actualShippingCost: Decimal;   // SoT: Bosta (005)
  campaignId: string | null;     // FIN-004: identifies campaign product
  marketingSource: string | null;
  advertisingCost: Decimal;      // campaign spend attributed to this order
  items: OrderItemFinancialInput[];
  adjustments: FinancialAdjustmentInput[];
  /**
   * Fixed expenses apportioned to this order for the period.
   *
   * RESPONSIBILITY BOUNDARY (007_FINANCIAL_ENGINE / 010_ANALYTICS_ENGINE):
   * The Financial Engine uses this value in the Net Profit formula (FIN-002) but does NOT
   * itself calculate how fixed expenses are apportioned across orders or periods.
   * Apportionment logic (e.g. dividing monthly rent across delivered orders in a month)
   * belongs to the Analytics layer, which prepares and injects this value before calling
   * processDeliveredOrder(). The Financial Engine treats it as an opaque input.
   * This preserves the rule: "Business calculations remain outside the Analytics Engine"
   * for the analytical apportionment step, while keeping the Net Profit formula inside
   * the Financial Engine where it belongs.
   */
  fixedExpensesForPeriod: Decimal;
  variableExpensesForOrder: Decimal; // variable expenses directly linked to this order
}

export interface OrderItemFinancialInput {
  orderItemId: string;
  productId: string;
  quantity: Decimal;
  unitPrice: Decimal;
  discount: Decimal;
  fifoCost: Decimal;             // from Inventory Engine LAYER_CONSUMED event
  isCampaignProduct: boolean;    // FIN-004: true for at most one item per order
}

export interface FinancialAdjustmentInput {
  adjustmentId: string;
  orderItemId: string | null;    // null = order-level adjustment
  amount: Decimal;               // positive = income, negative = expense
}

// ── Calculation outputs ────────────────────────────────────────────────────

/** Revenue breakdown per 007: REVENUE COMPONENTS */
export interface RevenueResult {
  formulaId: typeof FORMULA_IDS.REVENUE;
  formulaVersion: "1.0.0";
  orderId: string;
  productRevenue: Decimal;
  customerShippingFee: Decimal;
  totalRevenue: Decimal;        // productRevenue + customerShippingFee
  recognitionDate: Date;
}

/** FIN-003: Gross Profit = Revenue − COGS */
export interface GrossProfitResult {
  formulaId: typeof FORMULA_IDS.GROSS_PROFIT;
  formulaVersion: "1.0.0";
  orderId: string;
  revenue: Decimal;
  cogs: Decimal;
  grossProfit: Decimal;
  recognitionDate: Date;
}

/** SHIP-001: Shipping Subsidy = Actual Shipping Cost − Customer Shipping Fee */
export interface ShippingSubsidyResult {
  formulaId: typeof FORMULA_IDS.SHIPPING_SUBSIDY;
  formulaVersion: "1.0.0";
  orderId: string;
  actualShippingCost: Decimal;
  customerShippingFee: Decimal;
  shippingSubsidy: Decimal;     // may be positive, zero, or negative (007)
}

/** FIN-004: Profit Contribution per order item */
export interface ProfitContributionResult {
  formulaId: typeof FORMULA_IDS.PROFIT_CONTRIBUTION;
  formulaVersion: "1.0.0";
  orderItemId: string;
  orderId: string;
  productId: string;
  isCampaignProduct: boolean;
  productRevenue: Decimal;
  fifoCost: Decimal;
  advertisingCost: Decimal;     // non-zero only for campaign product (FIN-004)
  shippingCost: Decimal;        // non-zero only for campaign product (FIN-004)
  adjustments: Decimal;
  profitContribution: Decimal;
}

/** FIN-002: Net Profit = Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments */
export interface NetProfitResult {
  formulaId: typeof FORMULA_IDS.NET_PROFIT;
  formulaVersion: "1.0.0";
  orderId: string;
  revenue: Decimal;
  cogs: Decimal;
  shippingExpense: Decimal;
  marketingExpense: Decimal;
  variableExpenses: Decimal;
  fixedExpenses: Decimal;
  adjustments: Decimal;
  netProfit: Decimal;
  recognitionDate: Date;
}

// ── Formula Inspector trace (007: FORMULA INSPECTOR INTEGRATION) ──────────

export interface FormulaInspectorTrace {
  formulaId: FormulaId;
  formulaName: string;
  formulaVersion: string;
  businessPurpose: string;
  inputs: Record<string, string>;   // field name → value as string
  intermediateSteps: Array<{ label: string; value: string }>;
  output: string;
  sourceRecords: Array<{ entity: string; id: string }>;
  calculatedAt: Date;
}

// ── Full order financial result ────────────────────────────────────────────

export interface OrderFinancialResult {
  orderId: string;
  storeId: string;
  revenue: RevenueResult;
  shippingSubsidy: ShippingSubsidyResult;
  grossProfit: GrossProfitResult;
  netProfit: NetProfitResult;
  profitContributions: ProfitContributionResult[];
  // Advertising/shipping unallocated flag (FIN-004 exception)
  costsUnallocated: boolean;
  traces: FormulaInspectorTrace[];
}
