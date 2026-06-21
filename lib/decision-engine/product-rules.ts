export interface ProductRuleInput {
  netProfit: number;
  marginPct: number;
  deliveryRate: number;
  returnRate: number;
  availableQuantity: number;
  minimumStockThreshold: number;
  trueCpa?: number | null;
  roas?: number | null;
}

export interface ProductDecision {
  severity: "INFO" | "OPPORTUNITY" | "WARNING" | "RISK";
  message: string;
  action?: string;
}

export function evaluateProductRules(input: ProductRuleInput): ProductDecision[] {
  const decisions: ProductDecision[] = [];

  if (input.netProfit < 0) {
    decisions.push({
      severity: "RISK",
      message: "This product is currently losing money.",
      action: "Review ads, product cost, shipping cost, and return rate.",
    });
  }

  if (input.marginPct >= 30 && input.deliveryRate >= 70) {
    decisions.push({
      severity: "OPPORTUNITY",
      message: "This product has strong profit and delivery performance.",
      action: "Consider increasing budget or stock.",
    });
  }

  if (input.returnRate >= 25) {
    decisions.push({
      severity: "WARNING",
      message: "Return rate is high.",
      action: "Review product quality, offer, customer expectations, and shipping notes.",
    });
  }

  if (input.availableQuantity <= input.minimumStockThreshold) {
    decisions.push({
      severity: "WARNING",
      message: "Stock is near or below the minimum threshold.",
      action: "Prepare restock or reduce ad spend.",
    });
  }

  if (input.trueCpa != null && input.roas != null && input.trueCpa > 0 && input.roas < 1) {
    decisions.push({
      severity: "RISK",
      message: "Marketing efficiency is weak.",
      action: "Review campaign targeting, creatives, and offer.",
    });
  }

  return decisions;
}