/**
 * Analytics read repository.
 * Repository: 010_ANALYTICS_ENGINE.md — ANALYTICS VALIDATION, DASHBOARD DATASETS
 *             006_DATABASE_SPECIFICATION.md — read patterns
 *
 * Read-only. Aggregates persisted financial events and order data for KPI input.
 * Never recalculates financial values — reads pre-computed outputs from Financial Engine.
 */

import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { DateRange, OperationalRateInput } from "../domain/analytics.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("AnalyticsReadRepository");

// ── Financial aggregates (reads Financial Engine outputs) ─────────────────

export async function getFinancialTotals(
  storeId: string,
  range: DateRange,
) {
  const [revenueAgg, profitAgg, costAgg] = await Promise.all([
    prisma.revenueEvent.aggregate({
      where: {
        revenueDate: { gte: range.from, lte: range.to },
        order: { storeId },
      },
      _sum: { revenueAmount: true },
      _count: { _all: true },
    }),
    prisma.profitEvent.aggregate({
      where: {
        recognitionDate: { gte: range.from, lte: range.to },
        order: { storeId },
      },
      _sum: { grossProfit: true, netProfit: true },
    }),
    prisma.costEvent.aggregate({
      where: {
        recognitionDate: { gte: range.from, lte: range.to },
        order: { storeId },
      },
      _sum: { fifoCost: true },
    }),
  ]);

  return {
    totalRevenue: new Decimal(revenueAgg._sum.revenueAmount?.toString() ?? "0"),
    totalGrossProfit: new Decimal(profitAgg._sum.grossProfit?.toString() ?? "0"),
    totalNetProfit: new Decimal(profitAgg._sum.netProfit?.toString() ?? "0"),
    totalCogs: new Decimal(costAgg._sum.fifoCost?.toString() ?? "0"),
    deliveredOrderCount: revenueAgg._count._all,
  };
}

// ── Shipping aggregates ────────────────────────────────────────────────────

export async function getShippingTotals(storeId: string, range: DateRange) {
  const agg = await prisma.shipment.aggregate({
    where: {
      order: { storeId },
      deliveryDate: { gte: range.from, lte: range.to },
    },
    _sum: { actualShippingCost: true, codAmount: true },
    _count: { _all: true },
  });

  return {
    totalShippingCost: new Decimal(agg._sum.actualShippingCost?.toString() ?? "0"),
    shipmentCount: agg._count._all,
  };
}

// ── Operational rate input builder ────────────────────────────────────────

export async function buildOperationalRateInput(
  storeId: string,
  range: DateRange,
): Promise<OperationalRateInput> {
  const [total, delivered, returned, refused, exchanged] = await Promise.all([
    prisma.order.count({
      where: { storeId, orderDate: { gte: range.from, lte: range.to } },
    }),
    prisma.order.count({
      where: {
        storeId,
        orderDate: { gte: range.from, lte: range.to },
        orderStatus: "DELIVERED",
      },
    }),
    prisma.order.count({
      where: {
        storeId,
        orderDate: { gte: range.from, lte: range.to },
        shipmentStatus: "RETURNED",
      },
    }),
    prisma.order.count({
      where: {
        storeId,
        orderDate: { gte: range.from, lte: range.to },
        shipmentStatus: "DELIVERY_FAILED",
      },
    }),
    // Exchange: orders with EXCHANGE inventory movement
    prisma.inventoryMovement.groupBy({
      by: ["relatedOrderId"],
      where: {
        movementType: "EXCHANGE",
        occurredAt: { gte: range.from, lte: range.to },
        product: { storeId },
      },
    }).then((rows) => rows.length),
  ]);

  logger.debug("Operational rate input built", {
    metadata: { storeId, total, delivered, returned, refused, exchanged },
  });

  return {
    storeId,
    range,
    totalShippedOrders: total,
    deliveredOrders: delivered,
    returnedOrders: returned,
    refusedOrders: refused,
    exchangedOrders: exchanged,
  };
}

// ── Marketing spend aggregates ────────────────────────────────────────────

export async function getMarketingSpendByPlatform(
  storeId: string,
  range: DateRange,
) {
  const rows = await prisma.marketingSpend.groupBy({
    by: ["platform"],
    where: {
      storeId,
      spendDate: { gte: range.from, lte: range.to },
    },
    _sum: { amount: true },
  });

  return rows.map((r) => ({
    platform: r.platform,
    totalSpend: new Decimal(r._sum.amount?.toString() ?? "0"),
  }));
}

// ── Period date range helpers ─────────────────────────────────────────────

export function resolveDateRange(
  period: import("../domain/analytics.types").AnalyticsPeriod,
  custom?: DateRange,
): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "TODAY":
      return { from: today, to: now };
    case "YESTERDAY": {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      const ye = new Date(today); ye.setMilliseconds(-1);
      return { from: y, to: ye };
    }
    case "LAST_7_DAYS": {
      const f = new Date(today); f.setDate(f.getDate() - 7);
      return { from: f, to: now };
    }
    case "LAST_30_DAYS": {
      const f = new Date(today); f.setDate(f.getDate() - 30);
      return { from: f, to: now };
    }
    case "THIS_MONTH": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: f, to: now };
    }
    case "LAST_MONTH": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: f, to: t };
    }
    case "THIS_QUARTER": {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      return { from: new Date(now.getFullYear(), qStart, 1), to: now };
    }
    case "THIS_YEAR":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "LAST_YEAR": {
      const y = now.getFullYear() - 1;
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31, 23, 59, 59) };
    }
    case "CUSTOM":
      if (!custom) throw new Error("Custom period requires explicit DateRange");
      return custom;
    default:
      return { from: today, to: now };
  }
}
