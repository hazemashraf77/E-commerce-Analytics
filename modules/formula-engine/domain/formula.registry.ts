/**
 * Formula Registry — single source of truth for all formula definitions.
 * Repository: 068_FORMULA_ENGINE.md, 033_FORMULA_CATALOG.md
 * "Every Formula has one Formula ID, one Definition, one Owner, one Source." (068)
 * No calculation lives here — only metadata and inspector data shapes.
 */

export type FormulaDomain =
  | "FINANCIAL" | "INVENTORY" | "MARKETING" | "SHIPPING" | "HEALTH" | "CUSTOMER";

export type FormulaOwner =
  | "FINANCIAL_ENGINE" | "INVENTORY_ENGINE" | "MARKETING_ENGINE"
  | "SHIPPING_ENGINE" | "ANALYTICS_ENGINE" | "AI_ENGINE";

export interface FormulaDefinition {
  id: string;
  name: string;
  domain: FormulaDomain;
  owner: FormulaOwner;
  version: string;
  expression: string;
  businessMeaning: string;
  businessQuestion: string;
  inputs: Array<{ name: string; type: string; source: string }>;
  outputUnit: string;
  dependencies: string[];    // other formula IDs this depends on
  relatedKpis: string[];
  edgeCases: string[];
  nullBehavior: "ZERO" | "NULL" | "ERROR";
  lifecycleAware: boolean;   // true = only valid at specific lifecycle stage
  supportsDimensions: Array<"TOTAL" | "PER_ORDER" | "PER_ITEM" | "PER_PRODUCT">;
}

// ── FINANCIAL FORMULAS ─────────────────────────────────────────────────────

export const FORMULA_REGISTRY: Record<string, FormulaDefinition> = {

  // ── Revenue (FIN-001) ────────────────────────────────────────────────────
  "FIN-001": {
    id: "FIN-001", name: "Revenue", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Revenue = Product Revenue + Customer Shipping Fee",
    businessMeaning: "Total money received from customer for products and shipping.",
    businessQuestion: "How much money did this order generate?",
    inputs: [
      { name: "productRevenue", type: "Decimal", source: "Order Items (unit_price × quantity − discount)" },
      { name: "customerShippingFee", type: "Decimal", source: "Order.customer_shipping_fee" },
    ],
    outputUnit: "EGP",
    dependencies: [],
    relatedKpis: ["GROSS_REVENUE", "DELIVERED_REVENUE", "REVENUE_PER_ORDER"],
    edgeCases: ["Revenue is ZERO until order status = DELIVERED (BR-005)"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── Net Profit (FIN-002) ─────────────────────────────────────────────────
  "FIN-002": {
    id: "FIN-002", name: "Net Profit", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Net Profit = Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments",
    businessMeaning: "Final profitability after all documented business costs.",
    businessQuestion: "How much did the business actually make after every cost?",
    inputs: [
      { name: "revenue", type: "Decimal", source: "FIN-001" },
      { name: "cogs", type: "Decimal", source: "INV-001" },
      { name: "actualShippingCost", type: "Decimal", source: "Bosta (SoT: 005)" },
      { name: "advertisingCost", type: "Decimal", source: "Marketing Engine" },
      { name: "variableExpenses", type: "Decimal", source: "Expense Records" },
      { name: "fixedExpenses", type: "Decimal", source: "Fixed Expense Allocation" },
      { name: "adjustments", type: "Decimal", source: "Financial Adjustments" },
    ],
    outputUnit: "EGP",
    dependencies: ["FIN-001", "INV-001"],
    relatedKpis: ["NET_PROFIT", "PROFIT_MARGIN", "TRUE_PROFIT"],
    edgeCases: ["Can be negative", "Fixed expenses apportioned by Analytics Engine"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── Gross Profit (FIN-003) ───────────────────────────────────────────────
  "FIN-003": {
    id: "FIN-003", name: "Gross Profit", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Gross Profit = Revenue − COGS",
    businessMeaning: "Profit before operating expenses. Measures product-level efficiency.",
    businessQuestion: "How much did we make before shipping, marketing, and expenses?",
    inputs: [
      { name: "revenue", type: "Decimal", source: "FIN-001" },
      { name: "cogs", type: "Decimal", source: "INV-001" },
    ],
    outputUnit: "EGP",
    dependencies: ["FIN-001", "INV-001"],
    relatedKpis: ["GROSS_PROFIT", "GROSS_MARGIN"],
    edgeCases: ["Can be negative if COGS > Revenue"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── Profit Contribution (FIN-004) ────────────────────────────────────────
  "FIN-004": {
    id: "FIN-004", name: "Profit Contribution", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Campaign Product: Revenue − FIFO Cost − Advertising − Shipping ± Adjustments | Non-campaign: Revenue − FIFO Cost ± Adjustments",
    businessMeaning: "Per-product profitability with advertising and shipping allocated to campaign product only.",
    businessQuestion: "How much profit did this product actually contribute?",
    inputs: [
      { name: "productRevenue", type: "Decimal", source: "Order Item" },
      { name: "fifoCost", type: "Decimal", source: "INV-001" },
      { name: "advertisingCost", type: "Decimal", source: "Campaign (campaign product only)" },
      { name: "shippingCost", type: "Decimal", source: "Bosta (campaign product only)" },
    ],
    outputUnit: "EGP",
    dependencies: ["FIN-001", "INV-001"],
    relatedKpis: ["PROFIT_CONTRIBUTION", "CONTRIBUTION_MARGIN"],
    edgeCases: ["If no campaign product: advertising and shipping stay at order level"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── FIFO Cost / COGS (INV-001) ───────────────────────────────────────────
  "INV-001": {
    id: "INV-001", name: "FIFO Cost (COGS)", domain: "INVENTORY", owner: "INVENTORY_ENGINE",
    version: "1.0.0",
    expression: "FIFO Cost = Σ (Quantity Consumed × Unit Cost per Layer)",
    businessMeaning: "Actual inventory cost using first-in-first-out valuation.",
    businessQuestion: "What did the inventory we sold actually cost us?",
    inputs: [
      { name: "quantityConsumed", type: "number", source: "Order Item quantity" },
      { name: "unitCostPerLayer", type: "Decimal", source: "Inventory Layer (immutable after creation)" },
    ],
    outputUnit: "EGP",
    dependencies: [],
    relatedKpis: ["COGS", "GROSS_PROFIT", "INVENTORY_VALUE"],
    edgeCases: ["Unit cost is fixed at purchase time", "Multiple layers may be consumed per order"],
    nullBehavior: "ERROR",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── Shipping Subsidy (SHIP-001) ──────────────────────────────────────────
  "SHIP-001": {
    id: "SHIP-001", name: "Shipping Subsidy", domain: "SHIPPING", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Shipping Subsidy = Actual Shipping Cost − Customer Shipping Fee",
    businessMeaning: "Amount business absorbs or earns on shipping. Positive = cost, Negative = income.",
    businessQuestion: "How much are we subsidizing customer shipping?",
    inputs: [
      { name: "actualShippingCost", type: "Decimal", source: "Bosta (SoT)" },
      { name: "customerShippingFee", type: "Decimal", source: "Order.customer_shipping_fee" },
    ],
    outputUnit: "EGP",
    dependencies: [],
    relatedKpis: ["SHIPPING_SUBSIDY", "TRUE_SHIPPING_COST"],
    edgeCases: ["Positive = business pays extra", "Negative = business earns on shipping"],
    nullBehavior: "ZERO",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── True Profit (MKT-001 / cross-domain) ────────────────────────────────
  "TRUE-001": {
    id: "TRUE-001", name: "True Profit", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "True Profit = Revenue − COGS − Packaging − Shipping − Return Shipping − Advertising − Refunds − Compensations − Allocated Expenses ± Manual Adjustments",
    businessMeaning: "Complete profitability including every applicable business cost. The definitive profitability metric.",
    businessQuestion: "What is the true bottom line after every cost?",
    inputs: [
      { name: "revenue", type: "Decimal", source: "FIN-001" },
      { name: "cogs", type: "Decimal", source: "INV-001" },
      { name: "packagingCost", type: "Decimal", source: "Order Expense" },
      { name: "shippingCost", type: "Decimal", source: "Bosta" },
      { name: "returnShippingCost", type: "Decimal", source: "Return Records" },
      { name: "advertisingCost", type: "Decimal", source: "Marketing Engine" },
      { name: "refunds", type: "Decimal", source: "Financial Adjustments" },
      { name: "compensations", type: "Decimal", source: "Financial Adjustments" },
      { name: "allocatedExpenses", type: "Decimal", source: "Expense Allocation" },
    ],
    outputUnit: "EGP",
    dependencies: ["FIN-001", "INV-001", "FIN-002"],
    relatedKpis: ["TRUE_PROFIT", "PROFIT_MARGIN", "PPAP"],
    edgeCases: ["Must include ALL costs — no hidden costs permitted (068: TRUE METRIC STANDARD)"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── Contribution Margin (MARG-001) ───────────────────────────────────────
  "MARG-001": {
    id: "MARG-001", name: "Contribution Margin", domain: "FINANCIAL", owner: "FINANCIAL_ENGINE",
    version: "1.0.0",
    expression: "Contribution Margin = Revenue − Variable Costs (COGS + Packaging + Shipping + Advertising)",
    businessMeaning: "Profit remaining after variable costs. Used for scaling decisions.",
    businessQuestion: "How much does each additional order contribute to covering fixed costs?",
    inputs: [
      { name: "revenue", type: "Decimal", source: "FIN-001" },
      { name: "cogs", type: "Decimal", source: "INV-001" },
      { name: "packagingCost", type: "Decimal", source: "Order Expense" },
      { name: "shippingCost", type: "Decimal", source: "Bosta" },
      { name: "advertisingCost", type: "Decimal", source: "Marketing Engine" },
    ],
    outputUnit: "EGP",
    dependencies: ["FIN-001", "INV-001"],
    relatedKpis: ["CONTRIBUTION_MARGIN", "CONTRIBUTION_MARGIN_PCT"],
    edgeCases: ["Fixed expenses excluded — only variable costs"],
    nullBehavior: "ZERO",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER", "PER_ITEM", "PER_PRODUCT"],
  },

  // ── MARKETING FORMULAS ────────────────────────────────────────────────────

  // ── True CPA (MKT-002) ───────────────────────────────────────────────────
  "MKT-002": {
    id: "MKT-002", name: "True CPA", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "True CPA = Total Ad Spend ÷ Delivered Orders",
    businessMeaning: "The real cost to acquire one paying customer after full delivery.",
    businessQuestion: "What did it actually cost to acquire each delivered customer?",
    inputs: [
      { name: "totalAdSpend", type: "Decimal", source: "Marketing Engine" },
      { name: "deliveredOrders", type: "number", source: "Order Engine (status=DELIVERED)" },
    ],
    outputUnit: "EGP per order",
    dependencies: [],
    relatedKpis: ["TRUE_CPA", "DELIVERED_CPA", "PPAP"],
    edgeCases: ["Returns to NULL if deliveredOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── Delivered CPA (MKT-003) ──────────────────────────────────────────────
  "MKT-003": {
    id: "MKT-003", name: "Delivered CPA", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Delivered CPA = Ad Spend ÷ Delivered Orders",
    businessMeaning: "Cost per delivered order — the primary CPA for e-commerce.",
    businessQuestion: "How much did we spend per successfully delivered order?",
    inputs: [
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
      { name: "deliveredOrders", type: "number", source: "Order Engine" },
    ],
    outputUnit: "EGP per order",
    dependencies: [],
    relatedKpis: ["DELIVERED_CPA", "TRUE_CPA"],
    edgeCases: ["NULL if deliveredOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── Advertising CPA (MKT-004) ─────────────────────────────────────────────
  "MKT-004": {
    id: "MKT-004", name: "Advertising CPA", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Advertising CPA = Ad Spend ÷ Total Orders",
    businessMeaning: "Cost per created order from advertising. Widest CPA definition.",
    businessQuestion: "How much did we spend per order created?",
    inputs: [
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
      { name: "totalOrders", type: "number", source: "Order Engine (all statuses)" },
    ],
    outputUnit: "EGP per order",
    dependencies: [],
    relatedKpis: ["ADVERTISING_CPA", "CONFIRMED_CPA"],
    edgeCases: ["NULL if totalOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── Confirmed CPA (MKT-005) ───────────────────────────────────────────────
  "MKT-005": {
    id: "MKT-005", name: "Confirmed CPA", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Confirmed CPA = Ad Spend ÷ Confirmed Orders",
    businessMeaning: "Cost per confirmed order — filters out invalid/cancelled orders.",
    businessQuestion: "How much did we spend per order that was actually confirmed?",
    inputs: [
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
      { name: "confirmedOrders", type: "number", source: "Order Engine (status≥CONFIRMED)" },
    ],
    outputUnit: "EGP per order",
    dependencies: [],
    relatedKpis: ["CONFIRMED_CPA", "SHIPPED_CPA"],
    edgeCases: ["NULL if confirmedOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── Shipped CPA (MKT-006) ─────────────────────────────────────────────────
  "MKT-006": {
    id: "MKT-006", name: "Shipped CPA", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Shipped CPA = Ad Spend ÷ Shipped Orders",
    businessMeaning: "Cost per shipped order — after operations confirmation.",
    businessQuestion: "How much per order that actually made it to shipping?",
    inputs: [
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
      { name: "shippedOrders", type: "number", source: "Order Engine (status=SHIPPED+)" },
    ],
    outputUnit: "EGP per order",
    dependencies: [],
    relatedKpis: ["SHIPPED_CPA", "DELIVERED_CPA"],
    edgeCases: ["NULL if shippedOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── Platform ROAS (MKT-010) ───────────────────────────────────────────────
  "MKT-010": {
    id: "MKT-010", name: "Platform ROAS", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Platform ROAS = Revenue Attributed by Platform ÷ Ad Spend",
    businessMeaning: "ROAS as reported by the advertising platform. Not True ROAS.",
    businessQuestion: "What does the platform claim as return on ad spend?",
    inputs: [
      { name: "platformAttributedRevenue", type: "Decimal", source: "Meta/TikTok/Google API" },
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
    ],
    outputUnit: "multiplier",
    dependencies: [],
    relatedKpis: ["PLATFORM_ROAS", "DELIVERED_ROAS", "TRUE_ROAS"],
    edgeCases: ["Platform may over-attribute — always compare with Delivered ROAS"],
    nullBehavior: "NULL",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL"],
  },

  // ── Delivered ROAS (MKT-011) ──────────────────────────────────────────────
  "MKT-011": {
    id: "MKT-011", name: "Delivered ROAS", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "Delivered ROAS = Delivered Revenue ÷ Ad Spend",
    businessMeaning: "Return on ad spend using only realized delivered revenue.",
    businessQuestion: "What revenue did delivered orders actually generate per advertising EGP?",
    inputs: [
      { name: "deliveredRevenue", type: "Decimal", source: "FIN-001 (DELIVERED orders only)" },
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
    ],
    outputUnit: "multiplier",
    dependencies: ["FIN-001"],
    relatedKpis: ["DELIVERED_ROAS", "TRUE_ROAS"],
    edgeCases: ["NULL if adSpend = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  // ── True ROAS (MKT-012) ───────────────────────────────────────────────────
  "MKT-012": {
    id: "MKT-012", name: "True ROAS", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "True ROAS = True Profit ÷ Ad Spend",
    businessMeaning: "Return on ad spend using True Profit — the only ROAS that shows business reality.",
    businessQuestion: "For every EGP spent on ads, how much profit did we actually generate?",
    inputs: [
      { name: "trueProfit", type: "Decimal", source: "TRUE-001" },
      { name: "adSpend", type: "Decimal", source: "Marketing Engine" },
    ],
    outputUnit: "multiplier",
    dependencies: ["TRUE-001"],
    relatedKpis: ["TRUE_ROAS", "PPAP"],
    edgeCases: ["Can be negative if True Profit < 0", "NULL if adSpend = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  // ── PPAP — Profit Per Advertising Pound (MKT-013) ─────────────────────────
  "MKT-013": {
    id: "MKT-013", name: "PPAP (Profit Per Advertising Pound)", domain: "MARKETING", owner: "MARKETING_ENGINE",
    version: "1.0.0",
    expression: "PPAP = True Profit ÷ Advertising Spend",
    businessMeaning: "Primary marketing profitability KPI. How much True Profit per EGP of advertising.",
    businessQuestion: "Is our advertising generating real profit or just revenue?",
    inputs: [
      { name: "trueProfit", type: "Decimal", source: "TRUE-001" },
      { name: "advertisingSpend", type: "Decimal", source: "Marketing Engine" },
    ],
    outputUnit: "EGP profit per EGP spend",
    dependencies: ["TRUE-001"],
    relatedKpis: ["PPAP", "TRUE_ROAS", "CONTRIBUTION_MARGIN"],
    edgeCases: ["PPAP < 1 means advertising is destroying profit", "NULL if spend = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL", "PER_PRODUCT"],
  },

  // ── SHIPPING FORMULAS ─────────────────────────────────────────────────────

  "SHP-001": {
    id: "SHP-001", name: "Delivery Rate", domain: "SHIPPING", owner: "SHIPPING_ENGINE",
    version: "1.0.0",
    expression: "Delivery Rate = Delivered Orders ÷ Shipped Orders × 100",
    businessMeaning: "Percentage of shipped orders successfully delivered. Primary shipping KPI.",
    businessQuestion: "What percentage of what we shipped actually reached the customer?",
    inputs: [
      { name: "deliveredOrders", type: "number", source: "Order Engine" },
      { name: "shippedOrders", type: "number", source: "Order Engine" },
    ],
    outputUnit: "%",
    dependencies: [],
    relatedKpis: ["DELIVERY_RATE", "SHIPPING_HEALTH"],
    edgeCases: ["NULL if shippedOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  "SHP-002": {
    id: "SHP-002", name: "Return Rate", domain: "SHIPPING", owner: "SHIPPING_ENGINE",
    version: "1.0.0",
    expression: "Return Rate = Returned Orders ÷ Delivered Orders × 100",
    businessMeaning: "Percentage of delivered orders that came back.",
    businessQuestion: "How many customers returned their orders?",
    inputs: [
      { name: "returnedOrders", type: "number", source: "Order Engine" },
      { name: "deliveredOrders", type: "number", source: "Order Engine" },
    ],
    outputUnit: "%",
    dependencies: [],
    relatedKpis: ["RETURN_RATE", "SHIPPING_HEALTH", "PROFIT_LEAKAGE"],
    edgeCases: ["NULL if deliveredOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  "SHP-003": {
    id: "SHP-003", name: "Refusal Rate", domain: "SHIPPING", owner: "SHIPPING_ENGINE",
    version: "1.0.0",
    expression: "Refusal Rate = Refused Orders ÷ Shipped Orders × 100",
    businessMeaning: "Percentage of shipped orders refused at door.",
    businessQuestion: "How many customers refused delivery?",
    inputs: [
      { name: "refusedOrders", type: "number", source: "Bosta (status=DELIVERY_FAILED)" },
      { name: "shippedOrders", type: "number", source: "Order Engine" },
    ],
    outputUnit: "%",
    dependencies: [],
    relatedKpis: ["REFUSAL_RATE", "SHIPPING_HEALTH", "PROFIT_LEAKAGE"],
    edgeCases: ["NULL if shippedOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  "SHP-004": {
    id: "SHP-004", name: "Exchange Rate", domain: "SHIPPING", owner: "SHIPPING_ENGINE",
    version: "1.0.0",
    expression: "Exchange Rate = Exchange Orders ÷ Delivered Orders × 100",
    businessMeaning: "Percentage of delivered orders that resulted in exchange.",
    businessQuestion: "How many customers requested an exchange?",
    inputs: [
      { name: "exchangeOrders", type: "number", source: "Order Engine" },
      { name: "deliveredOrders", type: "number", source: "Order Engine" },
    ],
    outputUnit: "%",
    dependencies: [],
    relatedKpis: ["EXCHANGE_RATE"],
    edgeCases: ["NULL if deliveredOrders = 0"],
    nullBehavior: "NULL",
    lifecycleAware: true,
    supportsDimensions: ["TOTAL"],
  },

  "SHP-005": {
    id: "SHP-005", name: "True Shipping Cost", domain: "SHIPPING", owner: "SHIPPING_ENGINE",
    version: "1.0.0",
    expression: "True Shipping Cost = Outbound Shipping + Return Shipping + Exchange Shipping",
    businessMeaning: "Total shipping cost including all return and exchange legs.",
    businessQuestion: "What is the real total cost of shipping including returns?",
    inputs: [
      { name: "outboundShipping", type: "Decimal", source: "Bosta" },
      { name: "returnShipping", type: "Decimal", source: "Bosta (return legs)" },
      { name: "exchangeShipping", type: "Decimal", source: "Bosta (exchange legs)" },
    ],
    outputUnit: "EGP",
    dependencies: [],
    relatedKpis: ["TRUE_SHIPPING_COST", "SHIPPING_COST_PER_ORDER"],
    edgeCases: ["Return shipping is a profit leakage cost"],
    nullBehavior: "ZERO",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_ORDER"],
  },

  // ── INVENTORY FORMULAS ────────────────────────────────────────────────────

  "INV-002": {
    id: "INV-002", name: "Inventory Value", domain: "INVENTORY", owner: "INVENTORY_ENGINE",
    version: "1.0.0",
    expression: "Inventory Value = Σ (Remaining Quantity × FIFO Unit Cost) per Layer",
    businessMeaning: "Total capital locked in inventory at FIFO cost.",
    businessQuestion: "How much money is sitting in our warehouse?",
    inputs: [
      { name: "remainingQuantity", type: "number", source: "Inventory Layer" },
      { name: "fifoUnitCost", type: "Decimal", source: "Inventory Layer (immutable)" },
    ],
    outputUnit: "EGP",
    dependencies: ["INV-001"],
    relatedKpis: ["INVENTORY_VALUE", "CASH_LOCKED", "INVENTORY_ROI"],
    edgeCases: ["Includes only active layers — consumed layers excluded"],
    nullBehavior: "ZERO",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_PRODUCT"],
  },

  "INV-003": {
    id: "INV-003", name: "Inventory Velocity", domain: "INVENTORY", owner: "INVENTORY_ENGINE",
    version: "1.0.0",
    expression: "Inventory Velocity = Units Sold ÷ Days in Period",
    businessMeaning: "Average units consumed per day.",
    businessQuestion: "How fast are we selling inventory?",
    inputs: [
      { name: "unitsSold", type: "number", source: "Order Items (DELIVERED)" },
      { name: "daysInPeriod", type: "number", source: "Date Range" },
    ],
    outputUnit: "units/day",
    dependencies: [],
    relatedKpis: ["INVENTORY_VELOCITY", "DAYS_REMAINING", "STOCK_TURNOVER"],
    edgeCases: ["ZERO if no sales in period — not NULL"],
    nullBehavior: "ZERO",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_PRODUCT"],
  },

  "INV-004": {
    id: "INV-004", name: "Days Remaining", domain: "INVENTORY", owner: "INVENTORY_ENGINE",
    version: "1.0.0",
    expression: "Days Remaining = Available Stock ÷ Inventory Velocity",
    businessMeaning: "Estimated days of stock remaining at current sell rate.",
    businessQuestion: "When will we run out of stock?",
    inputs: [
      { name: "availableStock", type: "number", source: "Inventory Engine" },
      { name: "inventoryVelocity", type: "number", source: "INV-003" },
    ],
    outputUnit: "days",
    dependencies: ["INV-003"],
    relatedKpis: ["DAYS_REMAINING", "REORDER_POINT"],
    edgeCases: ["NULL if inventoryVelocity = 0 (no sales)"],
    nullBehavior: "NULL",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_PRODUCT"],
  },

  "INV-005": {
    id: "INV-005", name: "Cash Locked", domain: "INVENTORY", owner: "INVENTORY_ENGINE",
    version: "1.0.0",
    expression: "Cash Locked = Inventory Value of Non-Moving Stock",
    businessMeaning: "Capital trapped in slow/dead inventory unavailable for business operations.",
    businessQuestion: "How much money is stuck in inventory that isn't selling?",
    inputs: [
      { name: "inventoryValue", type: "Decimal", source: "INV-002" },
      { name: "movementThresholdDays", type: "number", source: "Configuration (default: 30)" },
    ],
    outputUnit: "EGP",
    dependencies: ["INV-002"],
    relatedKpis: ["CASH_LOCKED", "DEAD_STOCK_RATIO", "INVENTORY_ROI"],
    edgeCases: ["Dead stock threshold configurable — default 30 days no movement"],
    nullBehavior: "ZERO",
    lifecycleAware: false,
    supportsDimensions: ["TOTAL", "PER_PRODUCT"],
  },
};

/** Get a formula definition by ID */
export function getFormula(id: string): FormulaDefinition | undefined {
  return FORMULA_REGISTRY[id];
}

/** Get all formulas by domain */
export function getFormulasByDomain(domain: FormulaDomain): FormulaDefinition[] {
  return Object.values(FORMULA_REGISTRY).filter((f) => f.domain === domain);
}

/** Get all formula IDs */
export const ALL_FORMULA_IDS = Object.keys(FORMULA_REGISTRY);

/** Convenience: financial formula IDs */
export const FINANCIAL_FORMULA_IDS = {
  REVENUE:               "FIN-001",
  NET_PROFIT:            "FIN-002",
  GROSS_PROFIT:          "FIN-003",
  PROFIT_CONTRIBUTION:   "FIN-004",
  FIFO_COST:             "INV-001",
  SHIPPING_SUBSIDY:      "SHIP-001",
  TRUE_PROFIT:           "TRUE-001",
  CONTRIBUTION_MARGIN:   "MARG-001",
} as const;

export const MARKETING_FORMULA_IDS = {
  TRUE_CPA:        "MKT-002",
  DELIVERED_CPA:   "MKT-003",
  AD_CPA:          "MKT-004",
  CONFIRMED_CPA:   "MKT-005",
  SHIPPED_CPA:     "MKT-006",
  PLATFORM_ROAS:   "MKT-010",
  DELIVERED_ROAS:  "MKT-011",
  TRUE_ROAS:       "MKT-012",
  PPAP:            "MKT-013",
} as const;

export const SHIPPING_FORMULA_IDS = {
  DELIVERY_RATE:       "SHP-001",
  RETURN_RATE:         "SHP-002",
  REFUSAL_RATE:        "SHP-003",
  EXCHANGE_RATE:       "SHP-004",
  TRUE_SHIPPING_COST:  "SHP-005",
} as const;

export const INVENTORY_FORMULA_IDS = {
  INVENTORY_VALUE:     "INV-002",
  INVENTORY_VELOCITY:  "INV-003",
  DAYS_REMAINING:      "INV-004",
  CASH_LOCKED:         "INV-005",
} as const;
