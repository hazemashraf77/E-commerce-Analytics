/**
 * Product Performance Service — Sprint 2B Phase 1
 *
 * Repository: 076_METRICS_CATALOG.md, 075_HOMEPAGE_CONTRACT.md, 060_PRODUCT_INTELLIGENCE.md
 *
 * Single source of truth for all product-level KPIs.
 * All business calculations delegate to Formula Engine (kpi.calculator.ts).
 * This service owns only DB queries. No formula duplication.
 *
 * Data owners per 076_METRICS_CATALOG.md:
 *   Orders      → EasyOrders (via our canonical Order model)
 *   Shipments   → Bosta      (via our Shipment model, actualShippingCost)
 *   Marketing   → Meta / TikTok (via MarketingSpend)
 *   Inventory   → Inventory Engine (InventoryLayer)
 *   Financial   → Financial Engine (calcRevenue, calcGrossProfit, calcNetProfit, calcTrueProfit)
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import {
  calcRevenue,
  calcGrossProfit,
  calcNetProfit,
  calcTrueProfit,
  calcContributionMargin,
  calcProfitMarginPct,
  calcProfitLeakage,
  calcAdvertisingCpa,
  calcDeliveredCpa,
  calcTrueCpa,
  calcDeliveredRoas,
  calcTrueRoas,
  calcPpap,
  calcDeliveryRate,
  calcReturnRate,
  calcRefusalRate,
  calcTrueShippingCost,
  calcShippingCostPerOrder,
  calcInventoryVelocity,
  calcDaysRemaining,
  classifyInventoryStatus,
  type ProductKpiRow,
} from "@/modules/formula-engine/application/kpi.calculator";

const logger = createLogger("ProductPerformanceService");

export interface ProductPerformanceInput {
  storeId: string;
  from: Date;
  to: Date;
}

export interface ProductPerformanceResult {
  products: ProductKpiRow[];
  computedAt: string;
  periodDays: number;
  periodMonths: number;
  source: "DB_KPI_CALCULATOR";
}

/**
 * Compute per-product KPI rows for the specified period.
 * Every value comes from the DB; every calculation uses the Formula Engine.
 * No mock data. No duplicated formulas.
 */
export async function computeProductPerformance(
  input: ProductPerformanceInput,
): Promise<ProductPerformanceResult> {
  const { storeId, from, to } = input;
  const periodDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  const periodMonths = Math.max(1 / 30, periodDays / 30);

  logger.info("Computing product performance", {
    metadata: { storeId, from: from.toISOString(), to: to.toISOString(), periodDays },
  });

  // ── 1. Load all active products ──────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: {
      storeId,
      isDeleted: false,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      imageUrl: true,
      defaultSellingPrice: true,
      unitProductCost: true,
      packagingCost: true,
      minimumStockThreshold: true,
    },
  });

  if (products.length === 0) {
    return {
      products: [],
      computedAt: new Date().toISOString(),
      periodDays,
      periodMonths,
      source: "DB_KPI_CALCULATOR",
    };
  }

  const productIds = products.map((p) => p.id);

  // ── 2. Load OrderItem aggregates within period ────────────────────────────
  // Orders are filtered by orderDate. Shipment status is joined for lifecycle counts.
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: { storeId, orderDate: { gte: from, lte: to } },
    },
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPrice: true,
      discount: true,
      fifoCost: true,
      allocatedRevenue: true,
      order: {
        select: {
          id: true,
          orderStatus: true,
          customerShippingFee: true,
          shipment: {
            select: {
              shipmentStatus: true,
              actualShippingCost: true,
              deliveryDate: true,
              returnDate: true,
            },
          },
        },
      },
    },
  });

  // ── 3. Load marketing spend per product ──────────────────────────────────
  // MarketingSpend is store-level. Attribution at product level requires
  // Campaign→Product linkage which may not exist yet. For now: store total
  // allocated proportionally to delivered orders (Allocation Engine rule).
  const totalAdSpend = await prisma.marketingSpend.aggregate({
    where: { storeId, spendDate: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  const storeAdSpend = Number(totalAdSpend._sum.amount ?? 0);

  // ── 4. Load inventory state (current, not time-filtered) ─────────────────
  const inventoryLayers = await prisma.inventoryLayer.findMany({
    where: { productId: { in: productIds }, isDeleted: false },
    select: { productId: true, remainingQuantity: true, unitCost: true },
  });

  // ── 5. Load FinancialAdjustments for refunds/compensations ───────────────
  const adjustments = await prisma.financialAdjustment.findMany({
    where: {
      occurredAt: {
        gte: from,
        lte: to,
      },
      order: {
        storeId,
      },
    },
    select: {
      amount: true,
      order: {
        select: {
        orderItems: {
            select: {
              productId: true,
              quantity: true,
              unitPrice: true,
              discount: true,
            },
          },
        },
      },
    },
  });

  // ── 6. Load expenses for net profit / true profit ────────────────────────
  const [fixedExpenses, variableExpenses] = await Promise.all([
    prisma.fixedExpense.aggregate({
      where: { storeId, isDeleted: false, status: "ACTIVE" },
      _sum: { amount: true },
    }),
    prisma.variableExpense.aggregate({
      where: { storeId, isDeleted: false, expenseDate: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
  ]);
  const storeFixedExp = Number(fixedExpenses._sum.amount ?? 0);
  const storeVariableExp = Number(variableExpenses._sum.amount ?? 0);

  // ── 7. Build per-product aggregation maps ────────────────────────────────
  type OrderAgg = {
    orderIds: Set<string>;
    ordersConfirmed: number;
    ordersShipped: number;
    ordersDelivered: number;
    ordersReturned: number;
    ordersRefused: number;
    unitsDelivered: number;
    grossRevenue: number; // sum(qty * unitPrice - discount)
    customerShipFees: number;
    fifoCost: number;
    shipCostOutbound: number; // from Bosta actualShippingCost
    shipCostReturn: number;
  };

  const aggMap = new Map<string, OrderAgg>();
  for (const p of products) {
    aggMap.set(p.id, {
      orderIds: new Set(),
      ordersConfirmed: 0,
      ordersShipped: 0,
      ordersDelivered: 0,
      ordersReturned: 0,
      ordersRefused: 0,
      unitsDelivered: 0,
      grossRevenue: 0,
      customerShipFees: 0,
      fifoCost: 0,
      shipCostOutbound: 0,
      shipCostReturn: 0,
    });
  }

  for (const oi of orderItems) {
    const a = aggMap.get(oi.productId);
    if (!a) continue;
    const qty = Number(oi.quantity);
    const price = Number(oi.unitPrice);
    const disc = Number(oi.discount);
    const lineRev = qty * price - disc;
    const shipment = oi.order.shipment;
    const status = oi.order.orderStatus;
    const sStatus = shipment?.shipmentStatus ?? null;

    a.orderIds.add(oi.order.id);
    a.grossRevenue += lineRev;
    a.customerShipFees += Number(oi.order.customerShippingFee ?? 0) / Math.max(1, 1); // one shipment fee per order, divided if needed in future

    // FIFO cost from orderItem (set by inventory engine) or fallback to product cost
    a.fifoCost += Number(oi.fifoCost ?? 0);

    // Lifecycle counts per OrderStatus / ShipmentStatus
    if (
      status === "CONFIRMED" ||
      status === "PROCESSING" ||
      status === "READY_TO_SHIP" ||
      status === "SHIPPED" ||
      status === "DELIVERED" ||
      status === "CLOSED"
    ) {
      a.ordersConfirmed++;
    }
    if (status === "SHIPPED" || status === "DELIVERED" || status === "CLOSED") {
      a.ordersShipped++;
    }
    if (status === "DELIVERED" || status === "CLOSED" || sStatus === "DELIVERED") {
      a.ordersDelivered++;
      a.unitsDelivered += qty;
      a.shipCostOutbound += Number(shipment?.actualShippingCost ?? 0);
    }
    if (sStatus === "RETURNED" || sStatus === "EXPECTED_RETURN") {
      a.ordersReturned++;
      // Return shipping cost is the same as the outbound cost for the return leg
      a.shipCostReturn += Number(shipment?.actualShippingCost ?? 0);
    }
    if (sStatus === "DELIVERY_FAILED") {
      a.ordersRefused++;
    }
  }

  // ── 8. Per-product adjustments (refunds, compensations) ──────────────────
  type AdjAgg = { refunds: number; compensations: number; manual: number };

  const adjMap = new Map<string, AdjAgg>();

  for (const adj of adjustments) {
    const items = adj.order?.orderItems ?? [];
    if (items.length === 0) continue;

    const orderTotal = items.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0);
    }, 0);

    for (const item of items) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0);

      const share = orderTotal > 0 ? lineTotal / orderTotal : 1 / items.length;
      const allocatedAmount = Number(adj.amount) * share;

      const existing = adjMap.get(item.productId) ?? {
        refunds: 0,
        compensations: 0,
        manual: 0,
      };

      existing.manual += allocatedAmount;
      adjMap.set(item.productId, existing);
    }
  }

  // ── 9. Inventory map ──────────────────────────────────────────────────────
  type InvAgg = { stock: number; value: number };
  const invMap = new Map<string, InvAgg>();
  for (const layer of inventoryLayers) {
    const existing = invMap.get(layer.productId) ?? { stock: 0, value: 0 };
    const qty = Number(layer.remainingQuantity);
    const cost = Number(layer.unitCost);
    existing.stock += qty;
    existing.value += qty * cost;
    invMap.set(layer.productId, existing);
  }

  // ── 10. Total delivered orders across all products (for ad spend allocation) ─
  const totalDelivered = Array.from(aggMap.values()).reduce((s, a) => s + a.ordersDelivered, 0);

  // ── 11. Build ProductKpiRow for each product ──────────────────────────────
  const rows: ProductKpiRow[] = products.map((p) => {
    const a = aggMap.get(p.id) ?? {
      orderIds: new Set(),
      ordersConfirmed: 0,
      ordersShipped: 0,
      ordersDelivered: 0,
      ordersReturned: 0,
      ordersRefused: 0,
      unitsDelivered: 0,
      grossRevenue: 0,
      customerShipFees: 0,
      fifoCost: 0,
      shipCostOutbound: 0,
      shipCostReturn: 0,
    };
    const adj = adjMap.get(p.id) ?? { refunds: 0, compensations: 0, manual: 0 };
    const inv = invMap.get(p.id) ?? { stock: 0, value: 0 };

    // Allocate store-level ad spend by share of delivered orders (Allocation Engine)
    const productDeliveredShare = totalDelivered > 0 ? a.ordersDelivered / totalDelivered : 0;
    const allocatedAdSpend = storeAdSpend * productDeliveredShare;

    // Allocate store-level expenses by same share
    const allocatedFixed = storeFixedExp * productDeliveredShare;
    const allocatedVariable = storeVariableExp * productDeliveredShare;
    const allocatedExpenses = allocatedFixed + allocatedVariable;

    // Product packaging cost per unit
    const packCostPerUnit = Number(p.packagingCost ?? 0);
    const packCostTotal = packCostPerUnit * a.unitsDelivered;

    // Use FIFO cost if populated; otherwise fall back to product unitProductCost
    const effectiveCogs =
      a.fifoCost > 0 ? a.fifoCost : Number(p.unitProductCost ?? 0) * a.unitsDelivered;

    // Revenue = Formula FIN-001: product revenue + customer shipping fee
    const revenue = calcRevenue(a.grossRevenue, a.customerShipFees);

    // Financial calculations — all delegate to kpi.calculator.ts
    const grossProfit = calcGrossProfit(revenue, effectiveCogs);

    const netProfit = calcNetProfit(
      revenue,
      effectiveCogs,
      a.shipCostOutbound,
      allocatedAdSpend,
      packCostTotal,
      allocatedVariable,
      allocatedFixed,
      0, // adjustments handled in trueProfit
    );

    const trueProfit = calcTrueProfit(
      revenue,
      effectiveCogs,
      packCostTotal,
      a.shipCostOutbound,
      a.shipCostReturn,
      allocatedAdSpend,
      adj.refunds,
      adj.compensations,
      allocatedExpenses,
      adj.manual, // manual adjustments (FinancialAdjustment MANUAL type — future)
    );

    const contributionMargin = calcContributionMargin(
      revenue,
      effectiveCogs,
      a.shipCostOutbound,
      allocatedAdSpend,
      packCostTotal,
    );

    const profitMarginPct = calcProfitMarginPct(trueProfit, revenue);

    const profitLeakage = calcProfitLeakage({
      returnShippingCost: a.shipCostReturn,
      refusedShippingCost: 0,
      refunds: adj.refunds,
      compensations: adj.compensations,
      deadStockValue: 0,
      excessAdSpendOnNonDelivered: 0,
    });

    // Marketing KPIs
    const ordersCreated = a.orderIds.size;
    const advertisingCpa = calcAdvertisingCpa(allocatedAdSpend, ordersCreated);
    const deliveredCpa = calcDeliveredCpa(allocatedAdSpend, a.ordersDelivered);
    const trueCpa = calcTrueCpa(allocatedAdSpend, a.ordersDelivered);
    const deliveredRoas = calcDeliveredRoas(revenue, allocatedAdSpend);
    const trueRoas = calcTrueRoas(trueProfit, allocatedAdSpend);
    const ppap = calcPpap(trueProfit, allocatedAdSpend);

    // Shipping KPIs
    const deliveryRate = calcDeliveryRate(a.ordersDelivered, a.ordersShipped);
    const returnRate = calcReturnRate(a.ordersReturned, a.ordersDelivered);
    const refusalRate = calcRefusalRate(a.ordersRefused, a.ordersShipped);

    const trueShipCost = calcTrueShippingCost(a.shipCostOutbound, a.shipCostReturn, 0);
    calcShippingCostPerOrder(trueShipCost, a.ordersShipped);

    // Inventory KPIs
    const velocity = calcInventoryVelocity(a.unitsDelivered, periodDays);
    const daysRemaining = calcDaysRemaining(inv.stock, velocity);
    const cashLocked = inv.stock * Number(p.unitProductCost ?? 0);
    const inventoryStatus = classifyInventoryStatus(
      inv.stock,
      p.minimumStockThreshold ?? 0,
      daysRemaining,
    );

    // Per-order / per-item dimensional views
    const revenuePerOrder = ordersCreated > 0 ? revenue / ordersCreated : null;
    const profitPerOrder = a.ordersDelivered > 0 ? trueProfit / a.ordersDelivered : null;
    const revenuePerItem = a.unitsDelivered > 0 ? revenue / a.unitsDelivered : null;
    const profitPerItem = a.unitsDelivered > 0 ? trueProfit / a.unitsDelivered : null;

    return {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      // Lifecycle — Order counts
      ordersCreated,
      ordersConfirmed: a.ordersConfirmed,
      ordersShipped: a.ordersShipped,
      ordersDelivered: a.ordersDelivered,
      ordersReturned: a.ordersReturned,
      ordersRefused: a.ordersRefused,
      itemsDelivered: a.unitsDelivered,
      // Financial
      revenue,
      cogs: effectiveCogs,
      packagingCost: packCostTotal,
      shippingCost: a.shipCostOutbound,
      returnShippingCost: a.shipCostReturn,
      adSpend: allocatedAdSpend,
      grossProfit,
      netProfit,
      trueProfit,
      contributionMargin,
      profitLeakage,
      // Rates
      profitMarginPct,
      deliveryRate,
      returnRate,
      refusalRate,
      // Marketing
      advertisingCpa,
      deliveredCpa,
      trueCpa,
      deliveredRoas,
      trueRoas,
      ppap,
      // Per-order / item
      revenuePerOrder,
      profitPerOrder,
      revenuePerItem,
      profitPerItem,
      // Inventory
      stockAvailable: inv.stock,
      inventoryValue: inv.value,
      daysRemaining,
      inventoryStatus,
      cashLocked,
    };
  });

  logger.info("Product performance computed", {
    metadata: { storeId, productCount: rows.length, periodDays },
  });

  return {
    products: rows,
    computedAt: new Date().toISOString(),
    periodDays,
    periodMonths,
    source: "DB_KPI_CALCULATOR",
  };
}
