/**
 * GET /api/v1/orders?storeId=&status=&from=&to=&page=&pageSize=&sortBy=&sortDirection=
 * Returns paginated order list with filters.
 * Repository: 029_API_SPECIFICATION.md — PAGINATION, FILTERING, SORTING
 * Auth: READ_ONLY minimum
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { paginated, validationError } from "@/lib/api/response";
import { OrderListQuerySchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/db/prisma";

async function handler(request: NextRequest, _auth: AuthContext) {
  const parsed = OrderListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, page, pageSize, from, to, status, sortBy, sortDirection } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where = {
    storeId,
    ...(status ? { orderStatus: status } : {}),
    ...(from || to ? { orderDate: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: pageSize,
      orderBy: { [sortBy]: sortDirection },
      select: {
        id: true, providerOrderId: true, orderDate: true,
        orderStatus: true, shipmentStatus: true, paymentStatus: true,
        customerShippingFee: true, marketingSource: true, importedAt: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return paginated(orders, page, pageSize, total);
}

export const GET = withAuth(handler, "READ_ONLY");
