/**
 * GET /api/v1/score-history?storeId=&scoreId=&daysBack=&granularity=
 * Returns historical score snapshots for a store.
 * Repository Consistency Pass 2026-06-12 — Task 4, Task 6
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema, PaginationSchema } from "@/lib/api/schemas";
import {
  getScoreHistory,
  getAllScoreHistories,
  buildScoreTrendSummary,
} from "@/modules/score-engine/repositories/historical-score.repository";

const Schema = z.object({
  storeId:     StoreIdSchema,
  scoreId:     z.string().optional(),          // if absent, returns all 9
  daysBack:    z.coerce.number().min(1).max(365).default(30),
  granularity: z.enum(["DAILY","WEEKLY","MONTHLY"]).default("DAILY"),
  summary:     z.coerce.boolean().default(false), // if true, returns trend summary instead of raw snapshots
}).merge(PaginationSchema);

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, scoreId, daysBack, granularity, summary, page, pageSize } = parsed.data;

  if (scoreId) {
    const snapshots = await getScoreHistory(storeId, scoreId, daysBack);
    if (summary) {
      const trend = buildScoreTrendSummary(storeId, scoreId, snapshots, granularity);
      return ok(trend, { requestId: auth.requestId, scoreId, daysBack });
    }
    // Paginate
    const total = snapshots.length;
    const start = (page - 1) * pageSize;
    const page_data = snapshots.slice(start, start + pageSize);
    return ok({ items: page_data, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, {
      requestId: auth.requestId, scoreId, daysBack,
    });
  }

  // All scores
  const allHistories = await getAllScoreHistories(storeId, daysBack);
  if (summary) {
    const trends = Object.entries(allHistories).map(([id, snaps]) =>
      buildScoreTrendSummary(storeId, id, snaps, granularity),
    );
    return ok(trends, { requestId: auth.requestId, daysBack, count: trends.length });
  }

  return ok(allHistories, { requestId: auth.requestId, daysBack });
}

export const GET = withAuth(handler, "READ_ONLY");
