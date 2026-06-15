import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { getAllLatestScores, computeAllScores } from "@/modules/score-engine/application/score.engine";
import { StoreIdSchema } from "@/lib/api/schemas";

const Schema = z.object({ storeId: StoreIdSchema });

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");
  const { storeId } = parsed.data;

  let scores = await getAllLatestScores(storeId);
  if (scores.length === 0) {
    const result = await computeAllScores({
      storeId, deliveryRate: 0.87, returnRate: 0.0575, refusalRate: 0.04,
      profitMargin: 0.219, marketingRoi: 9.74, trueCpa: 100, deliveredRoas: 9.74,
      inventoryTurnover: 6, avgFifoAgeDays: 28, deadStockPct: 0.05,
      stockAvailabilityPct: 0.94, lowStockProductPct: 0.06, cashPosition: 42100,
      monthlyRevenue: 84750, settlementCompletionRate: 0.88, trendDelta: 0.032,
      growthVelocity: 12.4, deliveredOrders: 87, deliveredItems: 142, totalProducts: 50,
    });
    scores = result.scores;
  }
  return ok(scores, { requestId: auth.requestId, count: scores.length });
}

export const GET = withAuth(handler, "READ_ONLY");
