/**
 * Financial formula implementations.
 * Repository: 033_FORMULA_CATALOG v2.1.0 — FIN-001, FIN-002, FIN-003, FIN-004, SHIP-001
 *             007_FINANCIAL_ENGINE.md — all formula definitions
 *             002_BUSINESS_RULES.md — BR-005–010
 *
 * RULES:
 *  • Every function references its Formula ID (CP-003, 007)
 *  • Pure functions — no DB access, no side effects
 *  • Decimal(18,4) precision throughout (006: MONEY POLICY)
 *  • Rounding only at presentation layer (007: ROUNDING POLICY)
 *  • No formula invented — all expressions from Repository documents
 */

import { Decimal } from "@prisma/client/runtime/library";
import type {
  OrderFinancialInput,
  OrderItemFinancialInput,
  RevenueResult,
  GrossProfitResult,
  ShippingSubsidyResult,
  NetProfitResult,
  ProfitContributionResult,
} from "../domain/financial.types";
import { FORMULA_IDS } from "../domain/financial.types";

// ── FIN-001: Revenue ───────────────────────────────────────────────────────
// Expression: Revenue = Product Revenue + Customer Shipping Fee
// Source: 007_FINANCIAL_ENGINE — REVENUE COMPONENTS

export function calculateRevenue(input: OrderFinancialInput): RevenueResult {
  const productRevenue = input.items.reduce((sum, item) => {
    const lineRevenue = item.unitPrice.times(item.quantity).minus(item.discount);
    return sum.plus(lineRevenue);
  }, new Decimal(0));

  const totalRevenue = productRevenue.plus(input.customerShippingFee);

  return {
    formulaId: FORMULA_IDS.REVENUE,
    formulaVersion: "1.0.0",
    orderId: input.orderId,
    productRevenue,
    customerShippingFee: input.customerShippingFee,
    totalRevenue,
    recognitionDate: input.deliveredAt, // BR-005: only realized at Delivered
  };
}

// ── SHIP-001: Shipping Subsidy ─────────────────────────────────────────────
// Expression: Shipping Subsidy = Actual Shipping Cost − Customer Shipping Fee
// Source: 007_FINANCIAL_ENGINE — SHIPPING SUBSIDY, BR-009
// Result may be positive, zero, or negative (007: "Possible results: Positive, Zero, Negative")

export function calculateShippingSubsidy(input: OrderFinancialInput): ShippingSubsidyResult {
  const shippingSubsidy = input.actualShippingCost.minus(input.customerShippingFee);

  return {
    formulaId: FORMULA_IDS.SHIPPING_SUBSIDY,
    formulaVersion: "1.0.0",
    orderId: input.orderId,
    actualShippingCost: input.actualShippingCost,
    customerShippingFee: input.customerShippingFee,
    shippingSubsidy, // positive = business absorbs cost; negative = business earns on shipping
  };
}

// ── INV-001: FIFO Cost (COGS for an order) ────────────────────────────────
// Expression: COGS = Σ (quantityConsumed × unitCost) per FIFO layer per item
// Source: 007_FINANCIAL_ENGINE — COST OF GOODS SOLD, 008_INVENTORY_FIFO_ENGINE
// unitCost per layer is supplied from LAYER_CONSUMED inventory event — NOT calculated here again

export function calculateCogs(items: OrderItemFinancialInput[]): Decimal {
  return items.reduce((sum, item) => sum.plus(item.fifoCost), new Decimal(0));
}

// ── FIN-003: Gross Profit ──────────────────────────────────────────────────
// Expression: Gross Profit = Revenue − COGS
// Source: 033_FORMULA_CATALOG FIN-003, 007_FINANCIAL_ENGINE — GROSS PROFIT

export function calculateGrossProfit(
  input: OrderFinancialInput,
  revenue: RevenueResult,
): GrossProfitResult {
  const cogs = calculateCogs(input.items);
  const grossProfit = revenue.totalRevenue.minus(cogs);

  return {
    formulaId: FORMULA_IDS.GROSS_PROFIT,
    formulaVersion: "1.0.0",
    orderId: input.orderId,
    revenue: revenue.totalRevenue,
    cogs,
    grossProfit,
    recognitionDate: input.deliveredAt,
  };
}

// ── FIN-002: Net Profit ────────────────────────────────────────────────────
// Expression: Net Profit = Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments
// Source: 007_FINANCIAL_ENGINE — NET PROFIT

export function calculateNetProfit(
  input: OrderFinancialInput,
  revenue: RevenueResult,
): NetProfitResult {
  const cogs = calculateCogs(input.items);

  // Shipping expense = actual shipping cost per order (BR-010: per order, not per product)
  const shippingExpense = input.actualShippingCost;

  // Marketing expense = advertising cost attributed to this order
  const marketingExpense = input.advertisingCost;

  // Adjustments: sum all order-level and item-level adjustments
  const adjustments = input.adjustments.reduce(
    (sum, adj) => sum.plus(adj.amount),
    new Decimal(0),
  );

  const netProfit = revenue.totalRevenue
    .minus(cogs)
    .minus(shippingExpense)
    .minus(marketingExpense)
    .minus(input.variableExpensesForOrder)
    .minus(input.fixedExpensesForPeriod)
    .plus(adjustments);

  return {
    formulaId: FORMULA_IDS.NET_PROFIT,
    formulaVersion: "1.0.0",
    orderId: input.orderId,
    revenue: revenue.totalRevenue,
    cogs,
    shippingExpense,
    marketingExpense,
    variableExpenses: input.variableExpensesForOrder,
    fixedExpenses: input.fixedExpensesForPeriod,
    adjustments,
    netProfit,
    recognitionDate: input.deliveredAt,
  };
}

// ── FIN-004: Profit Contribution (Per Order Item) ─────────────────────────
// Source: 033_FORMULA_CATALOG FIN-004 (Business Owner Decision 2026-06-12)
//
// CAMPAIGN PRODUCT:
//   Profit Contribution = Revenue − FIFO Cost − Advertising Cost − Shipping Cost ± Adjustments
//
// NON-CAMPAIGN PRODUCTS:
//   Profit Contribution = Revenue − FIFO Cost ± Adjustments
//
// EXCEPTION (BR-FIN-004-04/05):
//   If no campaign product is present in the order, advertising and shipping
//   costs remain at order level and are NOT allocated to any product.

export function calculateProfitContributions(
  input: OrderFinancialInput,
): ProfitContributionResult[] {
  const campaignProductPresent = input.items.some((i) => i.isCampaignProduct);

  return input.items.map((item) => {
    const productRevenue = item.unitPrice.times(item.quantity).minus(item.discount);

    // Item-level adjustments only
    const itemAdjustments = input.adjustments
      .filter((a) => a.orderItemId === item.orderItemId)
      .reduce((sum, a) => sum.plus(a.amount), new Decimal(0));

    let advertisingCost = new Decimal(0);
    let shippingCost = new Decimal(0);

    if (item.isCampaignProduct && campaignProductPresent) {
      // BR-FIN-004-01: Advertising Cost belongs exclusively to the Campaign Product
      advertisingCost = input.advertisingCost;
      // BR-FIN-004-02: Actual Shipping Cost belongs exclusively to the Campaign Product
      shippingCost = input.actualShippingCost;
    }
    // BR-FIN-004-03: Non-campaign products receive zero for both
    // BR-FIN-004-05: If campaign product absent, both stay at order level (both already 0)

    const profitContribution = productRevenue
      .minus(item.fifoCost)
      .minus(advertisingCost)
      .minus(shippingCost)
      .plus(itemAdjustments);

    return {
      formulaId: FORMULA_IDS.PROFIT_CONTRIBUTION,
      formulaVersion: "1.0.0",
      orderItemId: item.orderItemId,
      orderId: input.orderId,
      productId: item.productId,
      isCampaignProduct: item.isCampaignProduct,
      productRevenue,
      fifoCost: item.fifoCost,
      advertisingCost,
      shippingCost,
      adjustments: itemAdjustments,
      profitContribution,
    };
  });
}
