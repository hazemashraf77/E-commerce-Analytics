/**
 * Formula Inspector.
 * Repository: 007_FINANCIAL_ENGINE.md — FORMULA INSPECTOR INTEGRATION
 *             033_FORMULA_CATALOG v2.1.0 — every entry must support inspection
 *
 * "Every financial value produced by the Financial Engine shall support
 *  Formula Inspector." (007)
 * "Financial calculations without Formula Inspector support are considered
 *  incomplete." (007)
 */

import type {
  FormulaInspectorTrace,
  FormulaId,
  RevenueResult,
  GrossProfitResult,
  ShippingSubsidyResult,
  NetProfitResult,
  ProfitContributionResult,
} from "./financial.types";

// ── Trace builders — one per formula ──────────────────────────────────────

export function traceRevenue(r: RevenueResult): FormulaInspectorTrace {
  return {
    formulaId: r.formulaId as FormulaId,
    formulaName: "Revenue",
    formulaVersion: r.formulaVersion,
    businessPurpose: "Total realized revenue for a delivered order (BR-005, 007_FINANCIAL_ENGINE)",
    inputs: {
      productRevenue: r.productRevenue.toString(),
      customerShippingFee: r.customerShippingFee.toString(),
    },
    intermediateSteps: [
      { label: "Product Revenue", value: r.productRevenue.toString() },
      { label: "Customer Shipping Fee", value: r.customerShippingFee.toString() },
      { label: "Total Revenue = Product Revenue + Customer Shipping Fee", value: r.totalRevenue.toString() },
    ],
    output: r.totalRevenue.toString(),
    sourceRecords: [{ entity: "Order", id: r.orderId }],
    calculatedAt: new Date(),
  };
}

export function traceShippingSubsidy(r: ShippingSubsidyResult): FormulaInspectorTrace {
  return {
    formulaId: r.formulaId as FormulaId,
    formulaName: "Shipping Subsidy",
    formulaVersion: r.formulaVersion,
    businessPurpose: "Cost absorbed by the business to cover shipping (BR-009, SHIP-001)",
    inputs: {
      actualShippingCost: r.actualShippingCost.toString(),
      customerShippingFee: r.customerShippingFee.toString(),
    },
    intermediateSteps: [
      { label: "Actual Shipping Cost (SoT: Bosta)", value: r.actualShippingCost.toString() },
      { label: "Customer Shipping Fee", value: r.customerShippingFee.toString() },
      { label: "Shipping Subsidy = Actual Shipping Cost − Customer Shipping Fee", value: r.shippingSubsidy.toString() },
    ],
    output: r.shippingSubsidy.toString(),
    sourceRecords: [{ entity: "Order", id: r.orderId }, { entity: "Shipment", id: r.orderId }],
    calculatedAt: new Date(),
  };
}

export function traceGrossProfit(r: GrossProfitResult): FormulaInspectorTrace {
  return {
    formulaId: r.formulaId as FormulaId,
    formulaName: "Gross Profit",
    formulaVersion: r.formulaVersion,
    businessPurpose: "Profit before operating expenses (FIN-003, 007_FINANCIAL_ENGINE)",
    inputs: {
      revenue: r.revenue.toString(),
      cogs: r.cogs.toString(),
    },
    intermediateSteps: [
      { label: "Revenue", value: r.revenue.toString() },
      { label: "COGS (FIFO — INV-001)", value: r.cogs.toString() },
      { label: "Gross Profit = Revenue − COGS", value: r.grossProfit.toString() },
    ],
    output: r.grossProfit.toString(),
    sourceRecords: [{ entity: "Order", id: r.orderId }],
    calculatedAt: new Date(),
  };
}

export function traceNetProfit(r: NetProfitResult): FormulaInspectorTrace {
  return {
    formulaId: r.formulaId as FormulaId,
    formulaName: "Net Profit",
    formulaVersion: r.formulaVersion,
    businessPurpose: "Final profitability after all expenses (FIN-002, 007_FINANCIAL_ENGINE)",
    inputs: {
      revenue: r.revenue.toString(),
      cogs: r.cogs.toString(),
      shippingExpense: r.shippingExpense.toString(),
      marketingExpense: r.marketingExpense.toString(),
      variableExpenses: r.variableExpenses.toString(),
      fixedExpenses: r.fixedExpenses.toString(),
      adjustments: r.adjustments.toString(),
    },
    intermediateSteps: [
      { label: "Revenue", value: r.revenue.toString() },
      { label: "− COGS", value: r.cogs.toString() },
      { label: "− Shipping Expense (Actual Shipping Cost)", value: r.shippingExpense.toString() },
      { label: "− Marketing Expense", value: r.marketingExpense.toString() },
      { label: "− Variable Expenses", value: r.variableExpenses.toString() },
      { label: "− Fixed Expenses", value: r.fixedExpenses.toString() },
      { label: "± Financial Adjustments", value: r.adjustments.toString() },
      { label: "Net Profit", value: r.netProfit.toString() },
    ],
    output: r.netProfit.toString(),
    sourceRecords: [{ entity: "Order", id: r.orderId }],
    calculatedAt: new Date(),
  };
}

export function traceProfitContribution(r: ProfitContributionResult): FormulaInspectorTrace {
  const steps = [
    { label: "Realized Product Revenue", value: r.productRevenue.toString() },
    { label: "− FIFO Cost (INV-001)", value: r.fifoCost.toString() },
  ];

  if (r.isCampaignProduct) {
    steps.push(
      { label: "− Advertising Cost (Campaign Product — FIN-004 BR-FIN-004-01)", value: r.advertisingCost.toString() },
      { label: "− Actual Shipping Cost (Campaign Product — FIN-004 BR-FIN-004-02)", value: r.shippingCost.toString() },
    );
  } else {
    steps.push(
      { label: "Advertising Cost = 0 (non-campaign product — FIN-004 BR-FIN-004-01)", value: "0" },
      { label: "Shipping Cost = 0 (non-campaign product — FIN-004 BR-FIN-004-02)", value: "0" },
    );
  }
  steps.push(
    { label: "± Product-Level Adjustments", value: r.adjustments.toString() },
    { label: "Profit Contribution", value: r.profitContribution.toString() },
  );

  return {
    formulaId: r.formulaId as FormulaId,
    formulaName: "Profit Contribution",
    formulaVersion: r.formulaVersion,
    businessPurpose: r.isCampaignProduct
      ? "Per-item profitability: campaign product bears advertising and shipping costs (FIN-004)"
      : "Per-item profitability: non-campaign product (FIN-004 — costs excluded per BR-FIN-004-01/02)",
    inputs: {
      productRevenue: r.productRevenue.toString(),
      fifoCost: r.fifoCost.toString(),
      advertisingCost: r.advertisingCost.toString(),
      shippingCost: r.shippingCost.toString(),
      adjustments: r.adjustments.toString(),
      isCampaignProduct: String(r.isCampaignProduct),
    },
    intermediateSteps: steps,
    output: r.profitContribution.toString(),
    sourceRecords: [
      { entity: "OrderItem", id: r.orderItemId },
      { entity: "Order", id: r.orderId },
    ],
    calculatedAt: new Date(),
  };
}
