/**
 * GET /api/v1/marketing/analytics?storeId=&period=&platform=
 * Marketing performance analytics per platform.
 * Auth: MARKETING minimum (032)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { MarketingQuerySchema } from "@/lib/api/schemas";
import { buildMarketingAnalyticsSummary, resolveDateRange } from "@/modules/analytics-engine";
import type { AnalyticsPeriod } from "@/modules/analytics-engine";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = MarketingQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, period, platform } = parsed.data;
  const range = resolveDateRange(period as AnalyticsPeriod);

  const where = {
    storeId,
    spendDate: { gte: range.from, lte: range.to },
    ...(platform !== "ALL" ? { platform: platform as any } : {}),
  };

  const spendRows = await prisma.marketingSpend.groupBy({
    by: ["platform"],
    where,
    _sum: { amount: true },
  });

  const deliveredByPlatform = await prisma.order.groupBy({
    by: ["marketingSource"],
    where: { storeId, orderStatus: "DELIVERED", orderDate: { gte: range.from, lte: range.to } },
    _count: { _all: true },
  });

  const revenueBySource = await prisma.revenueEvent.groupBy({
    by: [],
    where: { order: { storeId, orderDate: { gte: range.from, lte: range.to } }, revenueDate: { gte: range.from, lte: range.to } },
    _sum: { revenueAmount: true },
  });

  const totalRevenue = new Decimal(revenueBySource[0]?._sum.revenueAmount?.toString() ?? "0");

  const summaries = spendRows.map((row) => {
    const spend = new Decimal(row._sum.amount?.toString() ?? "0");
    const delivered = deliveredByPlatform.find((d) => d.marketingSource === row.platform)?._count._all ?? 0;
    return buildMarketingAnalyticsSummary({
      storeId, range,
      platform: row.platform,
      totalSpend: spend,
      totalRevenue,
      deliveredOrders: delivered,
    });
  });

  return ok(summaries, { requestId: auth.requestId, period, count: summaries.length });
}

export const GET = withAuth(handler, "MARKETING");
