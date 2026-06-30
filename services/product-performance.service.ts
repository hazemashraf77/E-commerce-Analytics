/**
 * Product Performance Service — Homepage Product Aggregator
 * Uses Business Status Engine as the single source of truth for lifecycle mapping.
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
import { evaluateBusinessStatus, isBusinessActivityInRange } from "@/services/business-status-engine";

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

type ProductKpiRowWithLifecycle = ProductKpiRow & Record<string, number | string | null>;

type Agg = {
  orderIds: Set<string>;
  countedLifecycleKeys: Set<string>;

  ordersNew: number;
  ordersPending: number;
  ordersConfirmed: number;
  ordersProcessing: number;
  ordersReadyToShip: number;
  ordersSentToBosta: number;
  ordersDeliveredStatus: number;
  ordersCancelled: number;
  ordersSpam: number;
  ordersNeedsReview: number;

  ordersDraft: number;
  ordersShippedStatus: number;
  ordersClosed: number;

  bostaNew: number;
  bostaReceived: number;
  bostaInTransit: number;
  bostaOutForDelivery: number;
  bostaDelivered: number;
  bostaRefused: number;
  bostaReturnRequested: number;
  bostaReturnCompleted: number;
  bostaExchangeRequested: number;
  bostaExchangeCompleted: number;
  bostaCancelled: number;
  bostaException: number;
  bostaLost: number;

  bostaPicked: number;
  bostaReturned: number;
  bostaExchange: number;

  ordersShipped: number;
  ordersDelivered: number;
  ordersReturned: number;
  ordersRefused: number;
  unitsDelivered: number;
  grossRevenue: number;
  customerShipFees: number;
  fifoCost: number;
  shipCostOutbound: number;
  shipCostReturn: number;
};

function emptyAgg(): Agg {
  return {
    orderIds: new Set<string>(),
    countedLifecycleKeys: new Set<string>(),

    ordersNew: 0,
    ordersPending: 0,
    ordersConfirmed: 0,
    ordersProcessing: 0,
    ordersReadyToShip: 0,
    ordersSentToBosta: 0,
    ordersDeliveredStatus: 0,
    ordersCancelled: 0,
    ordersSpam: 0,
    ordersNeedsReview: 0,

    ordersDraft: 0,
    ordersShippedStatus: 0,
    ordersClosed: 0,

    bostaNew: 0,
    bostaReceived: 0,
    bostaInTransit: 0,
    bostaOutForDelivery: 0,
    bostaDelivered: 0,
    bostaRefused: 0,
    bostaReturnRequested: 0,
    bostaReturnCompleted: 0,
    bostaExchangeRequested: 0,
    bostaExchangeCompleted: 0,
    bostaCancelled: 0,
    bostaException: 0,
    bostaLost: 0,

    bostaPicked: 0,
    bostaReturned: 0,
    bostaExchange: 0,

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
}

function addLifecycleOnce(params: {
  agg: Agg;
  key: string;
  orderId: string;
  quantity: number;
  shipmentCost: number;
  status: ReturnType<typeof evaluateBusinessStatus>;
}) {
  const { agg, key, orderId, quantity, shipmentCost, status } = params;
  if (agg.countedLifecycleKeys.has(key)) return;
  agg.countedLifecycleKeys.add(key);
  agg.orderIds.add(orderId);

  if (status.easy.new) {
    agg.ordersNew++;
    agg.ordersDraft++;
  }
  if (status.easy.confirmed) agg.ordersConfirmed++;
  if (status.easy.processing) agg.ordersProcessing++;
  if (status.easy.readyToShip) agg.ordersReadyToShip++;
  if (status.easy.sentToBosta) {
    agg.ordersSentToBosta++;
    agg.ordersShippedStatus++;
  }
  if (status.easy.delivered) agg.ordersDeliveredStatus++;
  if (status.easy.cancelled) agg.ordersCancelled++;
  if (status.easy.spam) agg.ordersSpam++;
  if (status.easy.needsReview) agg.ordersNeedsReview++;

  // Backward compatibility only. We intentionally do NOT put PENDING into "معلق" anymore.
  if (!status.easy.new && !status.easy.confirmed && !status.easy.cancelled && !status.easy.delivered && !status.easy.needsReview) {
    agg.ordersPending++;
  }

  if (status.bosta.new) agg.bostaNew++;
  if (status.bosta.received) {
    agg.bostaReceived++;
    agg.bostaPicked++;
  }
  if (status.bosta.inTransit) agg.bostaInTransit++;
  if (status.bosta.outForDelivery) agg.bostaOutForDelivery++;
  if (status.bosta.delivered) agg.bostaDelivered++;
  if (status.bosta.refused) agg.bostaRefused++;
  if (status.bosta.returnRequested) agg.bostaReturnRequested++;
  if (status.bosta.returnCompleted) agg.bostaReturnCompleted++;
  if (status.bosta.exchangeRequested) agg.bostaExchangeRequested++;
  if (status.bosta.exchangeCompleted) agg.bostaExchangeCompleted++;
  if (status.bosta.cancelled) agg.bostaCancelled++;
  if (status.bosta.problem) agg.bostaException++;
  if (status.bosta.lost) agg.bostaLost++;

  agg.bostaReturned = agg.bostaReturnRequested + agg.bostaReturnCompleted;
  agg.bostaExchange = agg.bostaExchangeRequested + agg.bostaExchangeCompleted;

  if (status.finance.outboundShippingEligible) {
    agg.ordersShipped++;
    agg.shipCostOutbound += shipmentCost;
  }

  if (status.flags.isDelivered) {
    agg.ordersDelivered++;
    agg.unitsDelivered += quantity;
  }

  if (status.flags.isReturned) {
    agg.ordersReturned++;
    agg.shipCostReturn += shipmentCost;
  }

  if (status.flags.isRefused) {
    agg.ordersRefused++;
  }
}

function shouldCountSaleRevenue(status: ReturnType<typeof evaluateBusinessStatus>): boolean {
  const isSaleDelivery =
    status.bosta.delivered ||
    status.easy.delivered ||
    status.flags.isDelivered;

  const isReturnOrExchangeOperation =
    status.raw.operationType === "RETURN" ||
    status.raw.operationType === "EXCHANGE" ||
    status.bosta.returnCompleted ||
    status.bosta.exchangeCompleted ||
    status.flags.isReturned ||
    status.flags.isExchange;

  return Boolean(isSaleDelivery && !isReturnOrExchangeOperation && !status.flags.isCancelled);
}

export async function computeProductPerformance(input: ProductPerformanceInput): Promise<ProductPerformanceResult> {
  const { storeId, from, to } = input;
  const periodDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  const periodMonths = Math.max(1 / 30, periodDays / 30);

  logger.info("Computing product performance", {
    metadata: { storeId, from: from.toISOString(), to: to.toISOString(), periodDays },
  });

  const products = await prisma.product.findMany({
    where: { storeId, isDeleted: false },
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

  const productIds = products.map((p) => p.id);

  const orderActivityWhere = {
    storeId,
    OR: [
      { orderDate: { gte: from, lte: to } },
      { updatedAt: { gte: from, lte: to } },
      { shipment: { is: { deliveryDate: { gte: from, lte: to } } } },
      { shipment: { is: { returnDate: { gte: from, lte: to } } } },
      { shipment: { is: { updatedAt: { gte: from, lte: to } } } },
    ],
  } as const;

  const [orderItems, providerItems, totalAdSpend, inventoryLayers, adjustments, fixedExpenses, variableExpenses] = await Promise.all([
    prisma.orderItem.findMany({
      where: { productId: { in: productIds }, order: orderActivityWhere },
      select: {
        id: true,
        productId: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        fifoCost: true,
        order: {
          select: {
            id: true,
            orderStatus: true,
            orderDate: true,
            updatedAt: true,
            customerShippingFee: true,
            shipment: {
              select: {
                shipmentStatus: true,
                actualShippingCost: true,
                deliveryDate: true,
                returnDate: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.providerOrderItem.findMany({
      where: {
        storeId,
        status: { not: "IGNORED" },
        orderId: { not: null },
        order: { is: orderActivityWhere },
      },
      select: {
        id: true,
        providerProductId: true,
        productId: true,
        sku: true,
        productName: true,
        quantity: true,
        unitPrice: true,
        discount: true,
        rawPayload: true,
        order: {
          select: {
            id: true,
            orderStatus: true,
            orderDate: true,
            updatedAt: true,
            customerShippingFee: true,
            shipment: {
              select: {
                shipmentStatus: true,
                actualShippingCost: true,
                deliveryDate: true,
                returnDate: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.marketingSpend.aggregate({
      where: { storeId, spendDate: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
    prisma.inventoryLayer.findMany({
      where: { productId: { in: productIds }, isDeleted: false },
      select: { productId: true, remainingQuantity: true, unitCost: true },
    }),
    prisma.financialAdjustment.findMany({
      where: { occurredAt: { gte: from, lte: to }, order: { storeId } },
      select: {
        amount: true,
        order: {
          select: {
            orderItems: { select: { productId: true, quantity: true, unitPrice: true, discount: true } },
          },
        },
      },
    }),
    prisma.fixedExpense.aggregate({
      where: { storeId, isDeleted: false, status: "ACTIVE" },
      _sum: { amount: true },
    }),
    prisma.variableExpense.aggregate({
      where: { storeId, isDeleted: false, expenseDate: { gte: from, lte: to } },
      _sum: { amount: true },
    }),
  ]);

  const storeAdSpend = Number(totalAdSpend._sum.amount ?? 0);
  const storeFixedExp = Number(fixedExpenses._sum.amount ?? 0);
  const storeVariableExp = Number(variableExpenses._sum.amount ?? 0);

  const aggMap = new Map<string, Agg>();
  for (const p of products) aggMap.set(p.id, emptyAgg());

  const providerOrderItemIds = new Set(providerItems.map((p) => p.order?.id).filter(Boolean) as string[]);

  // ProviderOrderItem is preferred because it carries the original imported payload/product identity.
  const virtualMeta = new Map<string, { productId: string; productName: string; sku: string }>();

  for (const item of providerItems) {
    const order = item.order;
    if (!order) continue;

    const status = evaluateBusinessStatus({
      easyOrdersStatus: order.orderStatus,
      orderStatus: order.orderStatus,
      shipmentStatus: order.shipment?.shipmentStatus,
      deliveryDate: order.shipment?.deliveryDate,
      returnDate: order.shipment?.returnDate,
      shipmentUpdatedAt: order.shipment?.updatedAt,
      orderDate: order.orderDate,
      orderUpdatedAt: order.updatedAt,
      rawPayload: item.rawPayload,
    });

    if (!isBusinessActivityInRange(status, from, to)) continue;

    const key = item.productId && aggMap.has(item.productId)
      ? item.productId
      : `provider:${item.providerProductId || item.sku || item.productName || item.id}`;

    if (!aggMap.has(key)) {
      aggMap.set(key, emptyAgg());
      virtualMeta.set(key, {
        productId: key,
        productName: item.productName || item.sku || "منتج مستورد غير مربوط",
        sku: item.sku || item.providerProductId || "UNMAPPED",
      });
    }

    const agg = aggMap.get(key)!;
    const qty = Number(item.quantity ?? 0);
    const price = Number(item.unitPrice ?? 0);
    const discount = Number(item.discount ?? 0);
    const lineRev = qty * price - discount;
    const shipmentCost = Number(order.shipment?.actualShippingCost ?? 0);

    const countSaleRevenue = shouldCountSaleRevenue(status);

    addLifecycleOnce({
      agg,
      key: `${key}:${order.id}`,
      orderId: order.id,
      quantity: countSaleRevenue ? qty : 0,
      shipmentCost,
      status,
    });

    if (countSaleRevenue) {
      agg.grossRevenue += lineRev;
      agg.customerShipFees += Number(order.customerShippingFee ?? 0);
    }
  }

  // Fallback for manual/native order items not represented by ProviderOrderItem.
  for (const oi of orderItems) {
    const order = oi.order;
    if (providerOrderItemIds.has(order.id)) continue;
    const agg = aggMap.get(oi.productId);
    if (!agg) continue;

    const status = evaluateBusinessStatus({
      easyOrdersStatus: order.orderStatus,
      orderStatus: order.orderStatus,
      shipmentStatus: order.shipment?.shipmentStatus,
      deliveryDate: order.shipment?.deliveryDate,
      returnDate: order.shipment?.returnDate,
      shipmentUpdatedAt: order.shipment?.updatedAt,
      orderDate: order.orderDate,
      orderUpdatedAt: order.updatedAt,
    });

    if (!isBusinessActivityInRange(status, from, to)) continue;

    const qty = Number(oi.quantity ?? 0);
    const price = Number(oi.unitPrice ?? 0);
    const discount = Number(oi.discount ?? 0);
    const lineRev = qty * price - discount;
    const shipmentCost = Number(order.shipment?.actualShippingCost ?? 0);

    const countSaleRevenue = shouldCountSaleRevenue(status);

    addLifecycleOnce({
      agg,
      key: `${oi.productId}:${order.id}`,
      orderId: order.id,
      quantity: countSaleRevenue ? qty : 0,
      shipmentCost,
      status,
    });

    if (countSaleRevenue) {
      agg.grossRevenue += lineRev;
      agg.customerShipFees += Number(order.customerShippingFee ?? 0);
      agg.fifoCost += Number(oi.fifoCost ?? 0);
    }
  }

  type AdjAgg = { refunds: number; compensations: number; manual: number };
  const adjMap = new Map<string, AdjAgg>();
  for (const adj of adjustments) {
    const items = adj.order?.orderItems ?? [];
    if (items.length === 0) continue;

    const orderTotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0), 0);
    for (const item of items) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0);
      const share = orderTotal > 0 ? lineTotal / orderTotal : 1 / items.length;
      const existing = adjMap.get(item.productId) ?? { refunds: 0, compensations: 0, manual: 0 };
      existing.manual += Number(adj.amount) * share;
      adjMap.set(item.productId, existing);
    }
  }

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

  const totalDelivered = Array.from(aggMap.values()).reduce((s, a) => s + a.ordersDelivered, 0);

  function buildProductRow(params: {
    productId: string;
    productName: string;
    sku: string;
    imageUrl: string | null;
    category: string | null;
    defaultSellingPrice: number;
    unitProductCost: number;
    packagingCostPerUnit: number;
    minimumStockThreshold: number;
    agg: Agg;
    inv: InvAgg;
    adj: AdjAgg;
    isVirtual: boolean;
  }): ProductKpiRowWithLifecycle {
    const { productId, productName, sku, imageUrl, category, defaultSellingPrice, unitProductCost, packagingCostPerUnit, minimumStockThreshold, agg, inv, adj, isVirtual } = params;

    const productDeliveredShare = totalDelivered > 0 ? agg.ordersDelivered / totalDelivered : 0;
    const allocatedAdSpend = storeAdSpend * productDeliveredShare;
    const allocatedFixed = storeFixedExp * productDeliveredShare;
    const allocatedVariable = storeVariableExp * productDeliveredShare;
    const allocatedExpenses = allocatedFixed + allocatedVariable;
    const packCostTotal = packagingCostPerUnit * agg.unitsDelivered;
    const effectiveCogs = agg.fifoCost > 0 ? agg.fifoCost : unitProductCost * agg.unitsDelivered;
    const revenue = calcRevenue(agg.grossRevenue, agg.customerShipFees);
    const grossProfit = calcGrossProfit(revenue, effectiveCogs);

    const netProfit = calcNetProfit(revenue, effectiveCogs, agg.shipCostOutbound, allocatedAdSpend, packCostTotal, allocatedVariable, allocatedFixed, 0);
    const trueProfit = calcTrueProfit(revenue, effectiveCogs, packCostTotal, agg.shipCostOutbound, agg.shipCostReturn, allocatedAdSpend, adj.refunds, adj.compensations, allocatedExpenses, adj.manual);
    const contributionMargin = calcContributionMargin(revenue, effectiveCogs, agg.shipCostOutbound, allocatedAdSpend, packCostTotal);
    const profitMarginPct = calcProfitMarginPct(trueProfit, revenue);

    const profitLeakage = calcProfitLeakage({
      returnShippingCost: agg.shipCostReturn,
      refusedShippingCost: 0,
      refunds: adj.refunds,
      compensations: adj.compensations,
      deadStockValue: 0,
      excessAdSpendOnNonDelivered: 0,
    });

    const ordersCreated = agg.orderIds.size;
    const advertisingCpa = calcAdvertisingCpa(allocatedAdSpend, ordersCreated);
    const deliveredCpa = calcDeliveredCpa(allocatedAdSpend, agg.ordersDelivered);
    const trueCpa = calcTrueCpa(allocatedAdSpend, agg.ordersDelivered);
    const deliveredRoas = calcDeliveredRoas(revenue, allocatedAdSpend);
    const trueRoas = calcTrueRoas(trueProfit, allocatedAdSpend);
    const ppap = calcPpap(trueProfit, allocatedAdSpend);

    const deliveryRate = calcDeliveryRate(agg.ordersDelivered, Math.max(agg.ordersShipped, agg.ordersDelivered));
    const returnRate = calcReturnRate(agg.ordersReturned, agg.ordersDelivered);
    const refusalRate = calcRefusalRate(agg.ordersRefused, Math.max(agg.ordersShipped, agg.ordersRefused));

    const trueShipCost = calcTrueShippingCost(agg.shipCostOutbound, agg.shipCostReturn, 0);
    calcShippingCostPerOrder(trueShipCost, agg.ordersShipped);

    const velocity = calcInventoryVelocity(agg.unitsDelivered, periodDays);
    const daysRemaining = calcDaysRemaining(inv.stock, velocity);
    const cashLocked = inv.stock * unitProductCost;
    const inventoryStatus = isVirtual ? "OUT_OF_STOCK" : classifyInventoryStatus(inv.stock, minimumStockThreshold, daysRemaining);

    const revenuePerOrder = ordersCreated > 0 ? revenue / ordersCreated : null;
    const profitPerOrder = agg.ordersDelivered > 0 ? trueProfit / agg.ordersDelivered : null;
    const revenuePerItem = agg.unitsDelivered > 0 ? revenue / agg.unitsDelivered : null;
    const profitPerItem = agg.unitsDelivered > 0 ? trueProfit / agg.unitsDelivered : null;

    return {
      productId,
      productName,
      sku,
      imageUrl,
      category,
      defaultSellingPrice,

      ordersNew: agg.ordersNew,
      ordersPending: agg.ordersPending,
      ordersCancelled: agg.ordersCancelled,
      ordersDraft: agg.ordersDraft,
      ordersProcessing: agg.ordersProcessing,
      ordersReadyToShip: agg.ordersReadyToShip,
      ordersSentToBosta: agg.ordersSentToBosta,
      ordersShippedStatus: agg.ordersShippedStatus,
      ordersDeliveredStatus: agg.ordersDeliveredStatus,
      ordersClosed: agg.ordersClosed,
      ordersSpam: agg.ordersSpam,
      ordersNeedsReview: agg.ordersNeedsReview,

      bostaNew: agg.bostaNew,
      bostaPicked: agg.bostaPicked,
      bostaReceived: agg.bostaReceived,
      bostaInTransit: agg.bostaInTransit,
      bostaOutForDelivery: agg.bostaOutForDelivery,
      bostaDelivered: agg.bostaDelivered,
      bostaReturned: agg.bostaReturned,
      bostaRefused: agg.bostaRefused,
      bostaExchange: agg.bostaExchange,
      bostaCancelled: agg.bostaCancelled,
      bostaException: agg.bostaException,
      bostaLost: agg.bostaLost,
      bostaReturnRequested: agg.bostaReturnRequested,
      bostaReturnCompleted: agg.bostaReturnCompleted,
      bostaExchangeRequested: agg.bostaExchangeRequested,
      bostaExchangeCompleted: agg.bostaExchangeCompleted,

      ordersCreated,
      ordersConfirmed: agg.ordersConfirmed,
      ordersShipped: agg.ordersShipped,
      ordersDelivered: agg.ordersDelivered,
      ordersReturned: agg.ordersReturned,
      ordersRefused: agg.ordersRefused,
      itemsDelivered: agg.unitsDelivered,

      revenue,
      cogs: effectiveCogs,
      packagingCost: packCostTotal,
      shippingCost: agg.shipCostOutbound,
      returnShippingCost: agg.shipCostReturn,
      adSpend: allocatedAdSpend,
      grossProfit,
      netProfit,
      trueProfit,
      contributionMargin,
      profitLeakage,

      profitMarginPct,
      deliveryRate,
      returnRate,
      refusalRate,

      advertisingCpa,
      deliveredCpa,
      trueCpa,
      deliveredRoas,
      trueRoas,
      ppap,

      revenuePerOrder,
      profitPerOrder,
      revenuePerItem,
      profitPerItem,

      stockAvailable: inv.stock,
      inventoryValue: inv.value,
      daysRemaining,
      inventoryStatus,
      cashLocked,
    } as ProductKpiRowWithLifecycle;
  }

  const rows: ProductKpiRow[] = [];

  for (const p of products) {
    const agg = aggMap.get(p.id) ?? emptyAgg();
    rows.push(buildProductRow({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      imageUrl: p.imageUrl,
      category: p.category,
      defaultSellingPrice: Number(p.defaultSellingPrice ?? 0),
      unitProductCost: Number(p.unitProductCost ?? 0),
      packagingCostPerUnit: Number(p.packagingCost ?? 0),
      minimumStockThreshold: p.minimumStockThreshold ?? 0,
      agg,
      inv: invMap.get(p.id) ?? { stock: 0, value: 0 },
      adj: adjMap.get(p.id) ?? { refunds: 0, compensations: 0, manual: 0 },
      isVirtual: false,
    }));
  }

  for (const [key, meta] of virtualMeta.entries()) {
    const agg = aggMap.get(key) ?? emptyAgg();
    rows.push(buildProductRow({
      productId: meta.productId,
      productName: meta.productName,
      sku: meta.sku,
      imageUrl: null,
      category: "مستورد من EasyOrders",
      defaultSellingPrice: 0,
      unitProductCost: 0,
      packagingCostPerUnit: 0,
      minimumStockThreshold: 0,
      agg,
      inv: { stock: 0, value: 0 },
      adj: { refunds: 0, compensations: 0, manual: 0 },
      isVirtual: true,
    }));
  }

  logger.info("Product performance computed", { metadata: { storeId, productCount: rows.length, periodDays } });

  return {
    products: rows,
    computedAt: new Date().toISOString(),
    periodDays,
    periodMonths,
    source: "DB_KPI_CALCULATOR",
  };
}
