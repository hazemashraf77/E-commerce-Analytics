export interface FormulaDefinition {
  key: string;
  name: string;
  category: "FINANCIAL" | "MARKETING" | "SHIPPING" | "INVENTORY" | "AOV";
  formula: string;
  description: string;
  dependencies: string[];
  version: number;
}

export const FORMULA_REGISTRY: FormulaDefinition[] = [
  {
    key: "net_profit",
    name: "Net Profit",
    category: "FINANCIAL",
    formula: "realisedRevenue - totalCost",
    description: "Real profit after product cost, packaging, shipping, ads, refunds and adjustments.",
    dependencies: ["realisedRevenue", "totalCost"],
    version: 1,
  },
  {
    key: "profit_margin",
    name: "Profit Margin",
    category: "FINANCIAL",
    formula: "netProfit / realisedRevenue * 100",
    description: "Percentage of realised revenue kept as profit.",
    dependencies: ["netProfit", "realisedRevenue"],
    version: 1,
  },
  {
    key: "cpa",
    name: "CPA",
    category: "MARKETING",
    formula: "adSpend / orders",
    description: "Advertising cost per order.",
    dependencies: ["adSpend", "orders"],
    version: 1,
  },
  {
    key: "true_cpa",
    name: "True CPA",
    category: "MARKETING",
    formula: "adSpend / deliveredOrders",
    description: "Advertising cost per delivered order.",
    dependencies: ["adSpend", "deliveredOrders"],
    version: 1,
  },
  {
    key: "roas",
    name: "ROAS",
    category: "MARKETING",
    formula: "revenue / adSpend",
    description: "Revenue generated per 1 EGP of ad spend.",
    dependencies: ["revenue", "adSpend"],
    version: 1,
  },
  {
    key: "true_roas",
    name: "True ROAS",
    category: "MARKETING",
    formula: "realisedRevenue / adSpend",
    description: "Delivered/realised revenue per 1 EGP of ad spend.",
    dependencies: ["realisedRevenue", "adSpend"],
    version: 1,
  },
  {
    key: "delivery_rate",
    name: "Delivery Rate",
    category: "SHIPPING",
    formula: "deliveredOrders / shippedOrders * 100",
    description: "Percentage of shipped orders that were delivered.",
    dependencies: ["deliveredOrders", "shippedOrders"],
    version: 1,
  },
  {
    key: "return_rate",
    name: "Return Rate",
    category: "SHIPPING",
    formula: "returnedOrders / shippedOrders * 100",
    description: "Percentage of shipped orders that returned.",
    dependencies: ["returnedOrders", "shippedOrders"],
    version: 1,
  },
  {
    key: "aov",
    name: "AOV",
    category: "AOV",
    formula: "revenue / orders",
    description: "Average order value.",
    dependencies: ["revenue", "orders"],
    version: 1,
  },
];

export function getFormulaDefinition(key: string): FormulaDefinition | null {
  return FORMULA_REGISTRY.find((formula) => formula.key === key) ?? null;
}