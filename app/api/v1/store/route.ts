/**
 * GET /api/v1/store
 * Returns the first active store.
 * Used by the Homepage to resolve the storeId for API calls.
 * Auth: READ_ONLY
 */
import { NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

async function handler(_req: NextRequest, auth: AuthContext) {
  const store = await prisma.store.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      currency: true,
      timeZone: true,
      status: true,
    },
  });

  return ok(store, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");