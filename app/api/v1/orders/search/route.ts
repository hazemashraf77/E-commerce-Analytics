/**
 * GET /api/v1/orders/search?q=&storeId=
 * "Search results shall remain deterministic. Search never modifies business data." (029)
 * Auth: READ_ONLY minimum
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/db/prisma";

const Schema = z.object({ q: z.string().min(1), storeId: StoreIdSchema });

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid search parameters", { issues: parsed.error.issues });

  const { q, storeId } = parsed.data;
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      OR: [
        { providerOrderId: { contains: q, mode: "insensitive" } },
        { orderItems: { some: { product: { sku: { contains: q, mode: "insensitive" } } } } },
      ],
    },
    take: 20,
    orderBy: { orderDate: "desc" },
    select: { id: true, providerOrderId: true, orderDate: true, orderStatus: true, shipmentStatus: true },
  });

  return ok(orders, { requestId: auth.requestId, query: q, count: orders.length });
}

export const GET = withAuth(handler, "READ_ONLY");
