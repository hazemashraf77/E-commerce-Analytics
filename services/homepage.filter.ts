import type { ProductKpiRow } from "@/modules/formula-engine";

export type SmartFilterKey =
  | "all"
  | "profitable"
  | "loss_making"
  | "high_cpa"
  | "low_roas"
  | "opportunity"
  | "high_returns"
  | "low_delivery"
  | "low_stock"
  | "dead_stock"
  | "slow_moving"
  | "fast_moving"
  | "needs_review"
  | "profit_leak"
  | "inventory_risk";

const HIGH_CPA_THRESHOLD = 200;
const LOW_ROAS_THRESHOLD = 1;
const HIGH_RETURN_THRESHOLD = 10;
const LOW_DELIVERY_THRESHOLD = 80;
const SLOW_MOVING_DAYS = 60;
const FAST_MOVING_DAYS = 7;

export function applySmartFilter(
  products: ProductKpiRow[],
  filter: SmartFilterKey,
): ProductKpiRow[] {
  switch (filter) {
    case "all":
      return products;

    case "profitable":
      return products.filter(p => p.trueProfit > 0);

    case "loss_making":
      return products.filter(p => p.trueProfit < 0);

    case "high_cpa":
      return products.filter(p => (p.trueCpa ?? 0) > HIGH_CPA_THRESHOLD);

    case "low_roas":
      return products.filter(
        p => p.adSpend > 0 && (p.trueRoas ?? 0) < LOW_ROAS_THRESHOLD,
      );

    case "opportunity":
      return products.filter(
        p => p.trueProfit > 0 && (p.trueRoas ?? 0) >= 1.5,
      );

    case "high_returns":
      return products.filter(
        p => ((p.returnRate ?? 0) * 100) > HIGH_RETURN_THRESHOLD,
      );

    case "low_delivery":
      return products.filter(
        p => ((p.deliveryRate ?? 100) < LOW_DELIVERY_THRESHOLD) &&
             p.ordersShipped > 0,
      );

    case "low_stock":
      return products.filter(
        p => p.inventoryStatus === "LOW_STOCK",
      );

    case "dead_stock":
      return products.filter(
        p => p.inventoryStatus === "DEAD_STOCK",
      );

    case "slow_moving":
      return products.filter(
        p => p.daysRemaining != null &&
             p.daysRemaining > SLOW_MOVING_DAYS,
      );

    case "fast_moving":
      return products.filter(
        p => p.daysRemaining != null &&
             p.daysRemaining < FAST_MOVING_DAYS,
      );

    case "needs_review":
      return products.filter(
        p =>
          p.inventoryStatus === "OUT_OF_STOCK" ||
          p.trueProfit < 0 ||
          (p.trueCpa ?? 0) > HIGH_CPA_THRESHOLD,
      );

    case "profit_leak":
      return products.filter(
        p => p.profitLeakage > 0,
      );

    case "inventory_risk":
      return products.filter(
        p =>
          p.inventoryStatus === "OUT_OF_STOCK" ||
          (p.daysRemaining != null && p.daysRemaining < 7),
      );

    default:
      return products;
  }
}