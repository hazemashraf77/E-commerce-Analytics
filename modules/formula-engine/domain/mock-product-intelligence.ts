/**
 * Mock product intelligence data.
 * Repository: 060_PRODUCT_INTELLIGENCE.md — Product KPI Table requirements
 *
 * Deterministic seeded data. Used when DB unavailable (preview mode).
 * All calculations use the KPI Calculator — no ad-hoc math here.
 */

import {
  calcRevenue, calcGrossProfit, calcTrueProfit, calcContributionMargin,
  calcProfitMarginPct, calcDeliveredCpa, calcTrueCpa, calcDeliveredRoas,
  calcTrueRoas, calcPpap, calcDeliveryRate, calcReturnRate, calcRefusalRate,
  calcInventoryVelocity, calcDaysRemaining, classifyInventoryStatus,
  type ProductKpiRow,
} from "../application/kpi.calculator";

interface RawProductData {
  productId: string;
  productName: string;
  sku: string;
  ordersCreated: number;
  ordersConfirmed: number;
  ordersShipped: number;
  ordersDelivered: number;
  ordersReturned: number;
  ordersRefused: number;
  itemsDelivered: number;
  unitPrice: number;
  unitCogs: number;
  packagingPerOrder: number;
  shippingPerOrder: number;
  returnShippingCost: number;
  adSpend: number;
  adjustments: number;
  stockAvailable: number;
  inventoryValue: number;
  daysInPeriod: number;
}

const RAW_PRODUCTS: RawProductData[] = [
  {
    productId: "PROD-001", productName: "Classic T-Shirt (Black, M)", sku: "TS-BLK-M",
    ordersCreated: 45, ordersConfirmed: 42, ordersShipped: 40, ordersDelivered: 35,
    ordersReturned: 2, ordersRefused: 3, itemsDelivered: 70,
    unitPrice: 299, unitCogs: 100, packagingPerOrder: 15, shippingPerOrder: 45,
    returnShippingCost: 90, adSpend: 1800, adjustments: 0,
    stockAvailable: 85, inventoryValue: 8500, daysInPeriod: 30,
  },
  {
    productId: "PROD-002", productName: "Cargo Pants (Khaki, L)", sku: "CP-KHK-L",
    ordersCreated: 28, ordersConfirmed: 26, ordersShipped: 24, ordersDelivered: 20,
    ordersReturned: 1, ordersRefused: 3, itemsDelivered: 22,
    unitPrice: 599, unitCogs: 220, packagingPerOrder: 20, shippingPerOrder: 50,
    returnShippingCost: 50, adSpend: 2200, adjustments: -50,
    stockAvailable: 30, inventoryValue: 6600, daysInPeriod: 30,
  },
  {
    productId: "PROD-003", productName: "Hoodie (Grey, XL)", sku: "HD-GRY-XL",
    ordersCreated: 18, ordersConfirmed: 17, ordersShipped: 15, ordersDelivered: 12,
    ordersReturned: 2, ordersRefused: 1, itemsDelivered: 13,
    unitPrice: 450, unitCogs: 160, packagingPerOrder: 18, shippingPerOrder: 48,
    returnShippingCost: 100, adSpend: 900, adjustments: 0,
    stockAvailable: 8, inventoryValue: 1280, daysInPeriod: 30,
  },
  {
    productId: "PROD-004", productName: "Sneakers (White, 42)", sku: "SN-WHT-42",
    ordersCreated: 12, ordersConfirmed: 10, ordersShipped: 9, ordersDelivered: 6,
    ordersReturned: 1, ordersRefused: 2, itemsDelivered: 6,
    unitPrice: 850, unitCogs: 380, packagingPerOrder: 25, shippingPerOrder: 55,
    returnShippingCost: 55, adSpend: 1500, adjustments: -100,
    stockAvailable: 0, inventoryValue: 0, daysInPeriod: 30,
  },
  {
    productId: "PROD-005", productName: "Cap (Black)", sku: "CAP-BLK",
    ordersCreated: 32, ordersConfirmed: 31, ordersShipped: 30, ordersDelivered: 28,
    ordersReturned: 0, ordersRefused: 2, itemsDelivered: 30,
    unitPrice: 149, unitCogs: 40, packagingPerOrder: 8, shippingPerOrder: 40,
    returnShippingCost: 0, adSpend: 700, adjustments: 0,
    stockAvailable: 120, inventoryValue: 4800, daysInPeriod: 30,
  },
];

function buildProductRow(p: RawProductData): ProductKpiRow {
  const grossRevenue  = p.ordersDelivered * p.unitPrice;
  const revenue       = calcRevenue(grossRevenue, 0); // no separate shipping fee at product level
  const cogs          = p.ordersDelivered * p.unitCogs;
  const totalPack     = p.ordersDelivered * p.packagingPerOrder;
  const totalShip     = p.ordersDelivered * p.shippingPerOrder;
  const grossProfit   = calcGrossProfit(revenue, cogs);
  const netProfit     = revenue - cogs - totalShip - p.adSpend - totalPack + p.adjustments;
  const trueProfit    = calcTrueProfit(
    revenue, cogs, totalPack, totalShip, p.returnShippingCost, p.adSpend, 0, 0, 0, p.adjustments,
  );
  const contribMargin = calcContributionMargin(revenue, cogs, totalPack, totalShip, p.adSpend);
  const profitLeak    = (p.returnShippingCost) + Math.max(0, -trueProfit);

  const velocity      = calcInventoryVelocity(p.ordersDelivered, p.daysInPeriod);
  const daysRemaining = calcDaysRemaining(p.stockAvailable, velocity);
  const invStatus     = classifyInventoryStatus(p.stockAvailable, velocity);

  return {
    productId:          p.productId,
    productName:        p.productName,
    sku:                p.sku,
    ordersCreated:      p.ordersCreated,
    ordersConfirmed:    p.ordersConfirmed,
    ordersShipped:      p.ordersShipped,
    ordersDelivered:    p.ordersDelivered,
    ordersReturned:     p.ordersReturned,
    ordersRefused:      p.ordersRefused,
    itemsDelivered:     p.itemsDelivered,
    revenue,
    cogs,
    packagingCost:      totalPack,
    shippingCost:       totalShip,
    returnShippingCost: p.returnShippingCost,
    adSpend:            p.adSpend,
    grossProfit,
    netProfit,
    trueProfit,
    contributionMargin: contribMargin,
    profitLeakage:      profitLeak,
    profitMarginPct:    calcProfitMarginPct(trueProfit, revenue),
    deliveryRate:       calcDeliveryRate(p.ordersDelivered, p.ordersShipped),
    returnRate:         calcReturnRate(p.ordersReturned, p.ordersDelivered),
    refusalRate:        calcRefusalRate(p.ordersRefused, p.ordersShipped),
    advertisingCpa:     calcDeliveredCpa(p.adSpend, p.ordersCreated),
    deliveredCpa:       calcDeliveredCpa(p.adSpend, p.ordersDelivered),
    trueCpa:            calcTrueCpa(p.adSpend, p.ordersDelivered),
    deliveredRoas:      calcDeliveredRoas(revenue, p.adSpend),
    trueRoas:           calcTrueRoas(trueProfit, p.adSpend),
    ppap:               calcPpap(trueProfit, p.adSpend),
    revenuePerOrder:    p.ordersDelivered > 0 ? revenue / p.ordersDelivered : null,
    profitPerOrder:     p.ordersDelivered > 0 ? trueProfit / p.ordersDelivered : null,
    revenuePerItem:     p.itemsDelivered > 0 ? revenue / p.itemsDelivered : null,
    profitPerItem:      p.itemsDelivered > 0 ? trueProfit / p.itemsDelivered : null,
    stockAvailable:     p.stockAvailable,
    inventoryValue:     p.inventoryValue,
    daysRemaining,
    inventoryStatus:    invStatus,
    cashLocked:         invStatus === "DEAD_STOCK" ? p.inventoryValue : 0,
  };
}

export const MOCK_PRODUCT_INTELLIGENCE: ProductKpiRow[] = RAW_PRODUCTS.map(buildProductRow);
