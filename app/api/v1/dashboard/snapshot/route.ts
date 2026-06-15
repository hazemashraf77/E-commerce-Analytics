/**
 * GET /api/v1/dashboard/snapshot?storeId=&from=&to=
 * Repository: 029_API_SPECIFICATION.md, 010_ANALYTICS_ENGINE.md. Auth: READ_ONLY.
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { getSnapshotsForRange } from "@/modules/analytics-engine";

const Schema = z.object({ storeId: StoreIdSchema, from: z.string().datetime({ offset: true }), to: z.string().datetime({ offset: true }) });

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });
  const snapshots = await getSnapshotsForRange(parsed.data.storeId, new Date(parsed.data.from), new Date(parsed.data.to));
  return ok(snapshots, { requestId: auth.requestId, count: snapshots.length });
}

export const GET = withAuth(handler, "READ_ONLY");
