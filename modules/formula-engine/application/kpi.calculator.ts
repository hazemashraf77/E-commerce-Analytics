/**
 * KPI Calculation Engine.
 * Repository: 069_KPI_DICTIONARY.md, 068_FORMULA_ENGINE.md, 072_BUSINESS_RULES_BIBLE.md
 *
 * Pure functions only — no DB access, no side effects.
 * Every function references its Formula ID.
 * All monetary values use Decimal for precision.
 * Supports: Total, Per Order, Per Item dimensions.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface DimensionalValue {
  total: number;
  perOrder: number | null;
  perItem: number | null;
  perProduct?: number | null;
  currency?: string;
  formulaId: string;
}

export interface ProductKpiRow {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string | null;
category: string | null;
defaultSellingPrice: number;

// EasyOrders lifecycle
ordersNew: number;
ordersPending: number;
ordersCancelled: number;

// Bosta lifecycle
bostaNew: number;
bostaPicked: number;
bostaInTransit: number;
bostaOutForDelivery: number;
bostaDelivered: number;
bostaReturned: number;
bostaRefused: number;
bostaExchange: number;
  // Lifecycle counts
  ordersCreated: number;
  ordersConfirmed: number;
  ordersShipped: number;
  ordersDelivered: number;
  ordersReturned: number;
  ordersRefused: number;
  itemsDelivered: number;
  // Financial (EGP)
  revenue: number;
  cogs: number;
  packagingCost: number;
  shippingCost: number;
  returnShippingCost: number;
  adSpend: number;
  grossProfit: number;
  netProfit: number;
  trueProfit: number;
  contributionMargin: number;
  profitLeakage: number;
  // Rates
  profitMarginPct: number;
  deliveryRate: number | null;
  returnRate: number | null;
  refusalRate: number | null;
  // Marketing
  advertisingCpa: number | null;
  deliveredCpa: number | null;
  trueCpa: number | null;
  deliveredRoas: number | null;
  trueRoas: number | null;
  ppap: number | null;
  // Per-order/item
  revenuePerOrder: number | null;
  profitPerOrder: number | null;
  revenuePerItem: number | null;
  profitPerItem: number | null;
  // Inventory
  stockAvailable: number;
  inventoryValue: number;
  daysRemaining: number | null;
  inventoryStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DEAD_STOCK";
  cashLocked: number;
}

export interface FinancialKpis {
  revenue: DimensionalValue;
  cogs: DimensionalValue;
  grossProfit: DimensionalValue;
  netProfit: DimensionalValue;
  trueProfit: DimensionalValue;
  contributionMargin: DimensionalValue;
  profitMarginPct: number;
  shippingSubsidy: number;
  packagingCost: DimensionalValue;
  shippingCost: DimensionalValue;
  returnShippingCost: DimensionalValue;
  adSpend: DimensionalValue;
  profitLeakage: number;
}

export interface MarketingKpis {
  adSpend: number;
  advertisingCpa: number | null;
  confirmedCpa: number | null;
  shippedCpa: number | null;
  deliveredCpa: number | null;
  trueCpa: number | null;
  platformRoas: number | null;
  deliveredRoas: number | null;
  trueRoas: number | null;
  ppap: number | null;
}

export interface ShippingKpis {
  deliveryRate: number | null;
  returnRate: number | null;
  refusalRate: number | null;
  exchangeRate: number | null;
  totalShippingCost: number;
  trueShippingCost: number;
  shippingCostPerOrder: number | null;
  avgDeliveryDays: number | null;
}

export interface InventoryKpis {
  inventoryValue: number;
  cashLocked: number;
  inventoryVelocity: number;    // units/day
  daysRemaining: number | null;
  inventoryRoi: number | null;
  deadStockRatio: number;
  stockTurnover: number | null;
}

export interface HealthScores {
  businessHealth: number;   // 0–100
  financialHealth: number;
  marketingHealth: number;
  shippingHealth: number;
  inventoryHealth: number;
  productHealth: number;
}

// ── FINANCIAL CALCULATIONS ─────────────────────────────────────────────────

/** FIN-001: Revenue */
export function calcRevenue(productRevenue: number, customerShippingFee: number): number {
  return productRevenue + customerShippingFee;
}

/** FIN-003: Gross Profit */
export function calcGrossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

/** FIN-002: Net Profit */
export function calcNetProfit(
  revenue: number,
  cogs: number,
  shippingCost: number,
  adSpend: number,
  packagingCost: number,
  variableExpenses: number,
  fixedExpenses: number,
  adjustments: number,
): number {
  return revenue - cogs - shippingCost - adSpend - packagingCost - variableExpenses - fixedExpenses + adjustments;
}

/** TRUE-001: True Profit — every applicable cost */
export function calcTrueProfit(
  revenue: number,
  cogs: number,
  packagingCost: number,
  shippingCost: number,
  returnShippingCost: number,
  adSpend: number,
  refunds: number,
  compensations: number,
  allocatedExpenses: number,
  adjustments: number,
): number {
  return revenue - cogs - packagingCost - shippingCost - returnShippingCost
    - adSpend - refunds - compensations - allocatedExpenses + adjustments;
}

/** MARG-001: Contribution Margin (variable costs only) */
export function calcContributionMargin(
  revenue: number,
  cogs: number,
  packagingCost: number,
  shippingCost: number,
  adSpend: number,
): number {
  return revenue - cogs - packagingCost - shippingCost - adSpend;
}

/** Profit Margin % */
export function calcProfitMarginPct(profit: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/** Profit Leakage = sum of all loss-generating costs on non-delivered or returned orders */
export function calcProfitLeakage(params: {
  returnShippingCost: number;
  refusedShippingCost: number;
  refunds: number;
  compensations: number;
  deadStockValue: number;
  excessAdSpendOnNonDelivered: number;
}): number {
  return params.returnShippingCost + params.refusedShippingCost + params.refunds
    + params.compensations + params.deadStockValue + params.excessAdSpendOnNonDelivered;
}

/** Dimensional value builder */
export function toDimensional(
  total: number,
  orderCount: number,
  itemCount: number,
  formulaId: string,
  currency = "EGP",
): DimensionalValue {
  return {
    total,
    perOrder: orderCount > 0 ? total / orderCount : null,
    perItem: itemCount > 0 ? total / itemCount : null,
    currency,
    formulaId,
  };
}

// ── MARKETING CALCULATIONS ─────────────────────────────────────────────────

/** MKT-004: Advertising CPA = Ad Spend ÷ Total Orders */
export function calcAdvertisingCpa(adSpend: number, totalOrders: number): number | null {
  if (totalOrders === 0) return null;
  return adSpend / totalOrders;
}

/** MKT-005: Confirmed CPA = Ad Spend ÷ Confirmed Orders */
export function calcConfirmedCpa(adSpend: number, confirmedOrders: number): number | null {
  if (confirmedOrders === 0) return null;
  return adSpend / confirmedOrders;
}

/** MKT-006: Shipped CPA = Ad Spend ÷ Shipped Orders */
export function calcShippedCpa(adSpend: number, shippedOrders: number): number | null {
  if (shippedOrders === 0) return null;
  return adSpend / shippedOrders;
}

/** MKT-003: Delivered CPA = Ad Spend ÷ Delivered Orders */
export function calcDeliveredCpa(adSpend: number, deliveredOrders: number): number | null {
  if (deliveredOrders === 0) return null;
  return adSpend / deliveredOrders;
}

/** MKT-002: True CPA = Total Ad Spend ÷ Delivered Orders (same as Delivered CPA for single campaign) */
export function calcTrueCpa(totalAdSpend: number, deliveredOrders: number): number | null {
  if (deliveredOrders === 0) return null;
  return totalAdSpend / deliveredOrders;
}

/** MKT-010: Platform ROAS = Platform Revenue ÷ Ad Spend */
export function calcPlatformRoas(platformRevenue: number, adSpend: number): number | null {
  if (adSpend === 0) return null;
  return platformRevenue / adSpend;
}

/** MKT-011: Delivered ROAS = Delivered Revenue ÷ Ad Spend */
export function calcDeliveredRoas(deliveredRevenue: number, adSpend: number): number | null {
  if (adSpend === 0) return null;
  return deliveredRevenue / adSpend;
}

/** MKT-012: True ROAS = True Profit ÷ Ad Spend */
export function calcTrueRoas(trueProfit: number, adSpend: number): number | null {
  if (adSpend === 0) return null;
  return trueProfit / adSpend;
}

/** MKT-013: PPAP = True Profit ÷ Advertising Spend */
export function calcPpap(trueProfit: number, advertisingSpend: number): number | null {
  if (advertisingSpend === 0) return null;
  return trueProfit / advertisingSpend;
}

// ── SHIPPING CALCULATIONS ─────────────────────────────────────────────────

/** SHP-001: Delivery Rate */
export function calcDeliveryRate(delivered: number, shipped: number): number | null {
  if (shipped === 0) return null;
  return (delivered / shipped) * 100;
}

/** SHP-002: Return Rate */
export function calcReturnRate(returned: number, delivered: number): number | null {
  if (delivered === 0) return null;
  return (returned / delivered) * 100;
}

/** SHP-003: Refusal Rate */
export function calcRefusalRate(refused: number, shipped: number): number | null {
  if (shipped === 0) return null;
  return (refused / shipped) * 100;
}

/** SHP-004: Exchange Rate */
export function calcExchangeRate(exchanged: number, delivered: number): number | null {
  if (delivered === 0) return null;
  return (exchanged / delivered) * 100;
}

/** SHP-005: True Shipping Cost */
export function calcTrueShippingCost(
  outbound: number,
  returnShipping: number,
  exchangeShipping: number,
): number {
  return outbound + returnShipping + exchangeShipping;
}

/** Shipping Cost Per Order */
export function calcShippingCostPerOrder(totalShippingCost: number, orders: number): number | null {
  if (orders === 0) return null;
  return totalShippingCost / orders;
}

// ── INVENTORY CALCULATIONS ─────────────────────────────────────────────────

/** INV-002: Inventory Value */
export function calcInventoryValue(
  layers: Array<{ remainingQty: number; unitCost: number }>,
): number {
  return layers.reduce((sum, l) => sum + l.remainingQty * l.unitCost, 0);
}

/** INV-003: Inventory Velocity */
export function calcInventoryVelocity(unitsSold: number, daysInPeriod: number): number {
  if (daysInPeriod === 0) return 0;
  return unitsSold / daysInPeriod;
}

/** INV-004: Days Remaining */
export function calcDaysRemaining(availableStock: number, velocity: number): number | null {
  if (velocity === 0) return null;
  return availableStock / velocity;
}

/** INV-005: Cash Locked */
export function calcCashLocked(
  deadStockValue: number,
  slowMovingValue: number,
): number {
  return deadStockValue + slowMovingValue;
}

/** Inventory ROI */
export function calcInventoryRoi(totalRevenue: number, inventoryValue: number): number | null {
  if (inventoryValue === 0) return null;
  return (totalRevenue / inventoryValue) * 100;
}

/** Inventory status classification */
export function classifyInventoryStatus(
  available: number,
  velocity: number,
  lowStockDays = 7,
): ProductKpiRow["inventoryStatus"] {
  if (available === 0) return "OUT_OF_STOCK";
  if (velocity === 0) return "DEAD_STOCK";
  const days = available / velocity;
  if (days <= lowStockDays) return "LOW_STOCK";
  return "IN_STOCK";
}

// ── HEALTH SCORES ──────────────────────────────────────────────────────────
// Scaffold — scoring methodology per 069 "standardized scoring methodology"

/** Score 0–100 from a rate (e.g. delivery rate 87% → score ~72) */
function rateToScore(rate: number | null, target: number, excellent: number): number {
  if (rate === null) return 50; // insufficient data → neutral
  const pct = Math.min(100, Math.max(0, rate));
  if (pct >= excellent) return 100;
  if (pct >= target) return 70 + ((pct - target) / (excellent - target)) * 30;
  return Math.max(0, (pct / target) * 70);
}

/** Score 0–100 from a profit margin % */
function marginToScore(marginPct: number): number {
  if (marginPct >= 30) return 100;
  if (marginPct >= 20) return 80;
  if (marginPct >= 10) return 60;
  if (marginPct >= 0) return 40;
  return 10; // negative margin
}

export function calcHealthScores(params: {
  profitMarginPct: number;
  deliveryRate: number | null;
  returnRate: number | null;
  refusalRate: number | null;
  inventoryDaysRemaining: number | null;
  ppap: number | null;
  trueCpa: number | null;
  targetDeliveryRate?: number;
}): HealthScores {
  const deliveryScore = rateToScore(params.deliveryRate, params.targetDeliveryRate ?? 85, 95);
  const refusalScore  = rateToScore(
    params.refusalRate !== null ? 100 - params.refusalRate : null, 90, 98,
  );
  const returnScore   = rateToScore(
    params.returnRate !== null ? 100 - params.returnRate : null, 90, 97,
  );
  const finScore      = marginToScore(params.profitMarginPct);
  const mktScore      = params.ppap !== null
    ? Math.min(100, Math.max(0, params.ppap * 50))
    : 50;
  const invScore      = params.inventoryDaysRemaining !== null
    ? (params.inventoryDaysRemaining >= 30 ? 90 : params.inventoryDaysRemaining >= 14 ? 70 : params.inventoryDaysRemaining >= 7 ? 50 : 20)
    : 50;

  const shippingHealth  = Math.round((deliveryScore * 0.5 + refusalScore * 0.3 + returnScore * 0.2));
  const financialHealth = finScore;
  const marketingHealth = Math.round((mktScore * 0.6 + (finScore) * 0.4));
  const inventoryHealth = invScore;
  const productHealth   = Math.round((finScore * 0.4 + deliveryScore * 0.3 + mktScore * 0.3));
  const businessHealth  = Math.round(
    (financialHealth * 0.3 + shippingHealth * 0.25 + marketingHealth * 0.2 +
     inventoryHealth * 0.15 + productHealth * 0.1),
  );

  return { businessHealth, financialHealth, marketingHealth, shippingHealth, inventoryHealth, productHealth };
}
