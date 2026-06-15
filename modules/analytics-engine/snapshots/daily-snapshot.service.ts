/**
 * Daily snapshot service.
 * Repository: 010_ANALYTICS_ENGINE.md — DAILY SNAPSHOTS
 *             004_CANONICAL_DATA_MODEL.md — Entity 024 (Daily Snapshot)
 *             006_DATABASE_SPECIFICATION.md — immutable (no updatedAt)
 *
 * "Snapshots are immutable." (010, 004)
 * "Benchmark calculations consume historical snapshots." (010)
 */

import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { formatIsoDate } from "@/utils/date";
import type { DailySnapshotInput } from "../domain/analytics.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("DailySnapshotService");

// ── Persist ────────────────────────────────────────────────────────────────

/**
 * Creates an immutable daily snapshot. Idempotent — skips if snapshot for
 * this storeId + date already exists (immutability rule: 010, 004 Entity 024).
 */
export async function createDailySnapshot(input: DailySnapshotInput): Promise<boolean> {
  const dateOnly = new Date(formatIsoDate(input.snapshotDate) + "T00:00:00Z");

  const existing = await prisma.dailySnapshot.findUnique({
    where: { storeId_snapshotDate: { storeId: input.storeId, snapshotDate: dateOnly } },
  });

  if (existing) {
    logger.warn("Daily snapshot already exists — skipping (immutability)", {
      metadata: { storeId: input.storeId, date: formatIsoDate(dateOnly) },
    });
    return false;
  }

  await prisma.dailySnapshot.create({
    data: {
      storeId: input.storeId,
      snapshotDate: dateOnly,
      revenue: input.revenue,
      profit: input.netProfit,
      cashPosition: input.cashPosition,
      inventoryValue: input.inventoryValue,
      marketingSpend: input.marketingSpend,
      deliveryRate: input.deliveryRate,
      returnRate: input.returnRate,
    },
  });

  logger.info("Daily snapshot created", {
    metadata: {
      storeId: input.storeId,
      date: formatIsoDate(dateOnly),
      revenue: input.revenue.toString(),
    },
  });

  return true;
}

// ── Read ────────────────────────────────────────────────────────────────────

export async function getSnapshotsForRange(
  storeId: string,
  from: Date,
  to: Date,
) {
  return prisma.dailySnapshot.findMany({
    where: {
      storeId,
      snapshotDate: { gte: from, lte: to },
    },
    orderBy: { snapshotDate: "asc" },
  });
}

export async function getLatestSnapshot(storeId: string) {
  return prisma.dailySnapshot.findFirst({
    where: { storeId },
    orderBy: { snapshotDate: "desc" },
  });
}

// ── Aggregate (consumed by benchmark/trend analysis) ─────────────────────

export async function aggregateSnapshotRange(
  storeId: string,
  from: Date,
  to: Date,
): Promise<{
  totalRevenue: Decimal;
  totalProfit: Decimal;
  avgDeliveryRate: Decimal;
  avgReturnRate: Decimal;
  totalMarketingSpend: Decimal;
  snapshotCount: number;
}> {
  const snapshots = await getSnapshotsForRange(storeId, from, to);

  if (snapshots.length === 0) {
    const zero = new Decimal(0);
    return { totalRevenue: zero, totalProfit: zero, avgDeliveryRate: zero, avgReturnRate: zero, totalMarketingSpend: zero, snapshotCount: 0 };
  }

  const n = snapshots.length;
  const totals = snapshots.reduce(
    (acc, s) => ({
      revenue: acc.revenue.plus(s.revenue),
      profit: acc.profit.plus(s.profit),
      deliveryRate: acc.deliveryRate.plus(s.deliveryRate),
      returnRate: acc.returnRate.plus(s.returnRate),
      marketingSpend: acc.marketingSpend.plus(s.marketingSpend),
    }),
    { revenue: new Decimal(0), profit: new Decimal(0), deliveryRate: new Decimal(0), returnRate: new Decimal(0), marketingSpend: new Decimal(0) },
  );

  return {
    totalRevenue: totals.revenue,
    totalProfit: totals.profit,
    avgDeliveryRate: n > 0 ? totals.deliveryRate.dividedBy(n) : new Decimal(0),
    avgReturnRate: n > 0 ? totals.returnRate.dividedBy(n) : new Decimal(0),
    totalMarketingSpend: totals.marketingSpend,
    snapshotCount: n,
  };
}
