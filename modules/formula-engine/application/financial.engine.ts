import { profit, marginPct, profitPerOrder, profitPerUnit, round2 } from "@/lib/kpis/core";

export interface ProductFinancialInput {
  realisedRevenue: number;
  projectedRevenue: number;
  cogs: number;
  packagingCost: number;
  shippingCost: number;
  returnShippingCost: number;
  adSpend: number;
  refunds: number;
  discounts: number;
  compensations: number;
  generalExpenses: number;
  deliveredOrders: number;
  deliveredUnits: number;
}

export interface ProductFinancialResult {
  totalCost: number;
  netProfit: number;
  projectedProfit: number;
  marginPct: number;
  profitPerOrder: number;
  profitPerUnit: number;
}

export function computeProductFinancials(input: ProductFinancialInput): ProductFinancialResult {
  const totalCost = round2(
    input.cogs +
    input.packagingCost +
    input.shippingCost +
    input.returnShippingCost +
    input.adSpend +
    input.refunds +
    input.discounts +
    input.compensations +
    input.generalExpenses,
  );

  const netProfit = profit(input.realisedRevenue, totalCost);
  const projectedProfit = profit(input.projectedRevenue, totalCost);

  return {
    totalCost,
    netProfit,
    projectedProfit,
    marginPct: marginPct(netProfit, input.realisedRevenue),
    profitPerOrder: profitPerOrder(netProfit, input.deliveredOrders),
    profitPerUnit: profitPerUnit(netProfit, input.deliveredUnits),
  };
}