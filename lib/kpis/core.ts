export function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pct(part: number, total: number): number {
  return round2(safeDivide(part, total) * 100);
}

export function marginPct(profit: number, revenue: number): number {
  return pct(profit, revenue);
}

export function cpa(spend: number, orders: number): number {
  return round2(safeDivide(spend, orders));
}

export function roas(revenue: number, spend: number): number {
  return round2(safeDivide(revenue, spend));
}

export function profit(revenue: number, totalCost: number): number {
  return round2(revenue - totalCost);
}

export function profitPerOrder(netProfit: number, orders: number): number {
  return round2(safeDivide(netProfit, orders));
}

export function profitPerUnit(netProfit: number, units: number): number {
  return round2(safeDivide(netProfit, units));
}