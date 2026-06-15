/**
 * Financial event repository.
 * Repository: 004_CANONICAL_DATA_MODEL.md — Entities 014, 015, 016, 017
 *             006_DATABASE_SPECIFICATION.md — HARD DELETE POLICY (financial records immutable)
 *             007_FINANCIAL_ENGINE.md — HISTORICAL FINANCIAL ACCURACY
 *
 * All financial events are append-only — no update or delete operations.
 * "Historical financial calculations must remain permanent." (007)
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type {
  RevenueResult,
  GrossProfitResult,
  NetProfitResult,
} from "../domain/financial.types";

const logger = createLogger("FinancialEventRepository");

// ── Revenue Event (Entity 014) ─────────────────────────────────────────────

export async function persistRevenueEvent(r: RevenueResult): Promise<void> {
  await prisma.revenueEvent.create({
    data: {
      orderId: r.orderId,
      revenueAmount: r.totalRevenue,
      revenueDate: r.recognitionDate,
      recognitionStatus: "RECOGNIZED",
    },
  });
  logger.info("Revenue event persisted", {
    metadata: { orderId: r.orderId, amount: r.totalRevenue.toString() },
  });
}

// ── Cost Event (Entity 015) ────────────────────────────────────────────────

export async function persistCostEvent(r: GrossProfitResult): Promise<void> {
  await prisma.costEvent.create({
    data: {
      orderId: r.orderId,
      fifoCost: r.cogs,
      recognitionDate: r.recognitionDate,
    },
  });
  logger.info("Cost event persisted", {
    metadata: { orderId: r.orderId, cogs: r.cogs.toString() },
  });
}

// ── Profit Event (Entity 016) ─────────────────────────────────────────────

export async function persistProfitEvent(
  gross: GrossProfitResult,
  net: NetProfitResult,
): Promise<void> {
  const profitMargin = net.revenue.isZero()
    ? new (await import("@prisma/client/runtime/library")).Decimal(0)
    : net.netProfit.dividedBy(net.revenue);

  await prisma.profitEvent.create({
    data: {
      orderId: gross.orderId,
      grossProfit: gross.grossProfit,
      netProfit: net.netProfit,
      profitMargin,
      recognitionDate: gross.recognitionDate,
    },
  });
  logger.info("Profit event persisted", {
    metadata: {
      orderId: gross.orderId,
      grossProfit: gross.grossProfit.toString(),
      netProfit: net.netProfit.toString(),
    },
  });
}

// ── Order items: persist profitContribution ────────────────────────────────

export async function persistProfitContributions(
  contributions: Array<{ orderItemId: string; profitContribution: import("@prisma/client/runtime/library").Decimal }>,
): Promise<void> {
  await Promise.all(
    contributions.map((c) =>
      prisma.orderItem.update({
        where: { id: c.orderItemId },
        data: { profitContribution: c.profitContribution },
      }),
    ),
  );
  logger.info("Profit contributions persisted", {
    metadata: { count: contributions.length },
  });
}

// ── FIFO cost write-back to order items ───────────────────────────────────

export async function persistFifoCosts(
  items: Array<{ orderItemId: string; fifoCost: import("@prisma/client/runtime/library").Decimal }>,
): Promise<void> {
  await Promise.all(
    items.map((i) =>
      prisma.orderItem.update({
        where: { id: i.orderItemId },
        data: { fifoCost: i.fifoCost },
      }),
    ),
  );
}

// ── Read: check if order already has financial events ─────────────────────

export async function hasRevenueEvent(orderId: string): Promise<boolean> {
  const count = await prisma.revenueEvent.count({ where: { orderId } });
  return count > 0;
}
