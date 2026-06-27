import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

async function GETHandler(
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string>,
) {
  if (!params?.id) {
    return validationError("Product id required");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      isDeleted: false,
    },
  });

  if (!product) {
    return notFound("Product not found");
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: product.id,
    },
    include: {
      order: {
        include: {
          shipment: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const byDate = new Map<string, {
    date: string;
    orders: number;
    units: number;
    revenue: number;
    profit: number;
  }>();

  const easyOrdersStatus: Record<string, number> = {};
  const bostaStatus: Record<string, number> = {};

  for (const item of orderItems) {
    const date = item.order.orderDate.toISOString().slice(0, 10);
    const quantity = Number(item.quantity);
    const revenue =
      quantity * Number(item.unitPrice) - Number(item.discount ?? 0);

    const cogs = product.unitProductCost
      ? quantity * Number(product.unitProductCost)
      : 0;

    const packaging = product.packagingCost
      ? quantity * Number(product.packagingCost)
      : 0;

    const shipping = Number(item.order.shipment?.actualShippingCost ?? 0);
    const profit = revenue - cogs - packaging - shipping;

    const current = byDate.get(date) ?? {
      date,
      orders: 0,
      units: 0,
      revenue: 0,
      profit: 0,
    };

    current.orders += 1;
    current.units += quantity;
    current.revenue += revenue;
    current.profit += profit;

    byDate.set(date, current);

    const orderStatus = item.order.orderStatus ?? "UNKNOWN";
    easyOrdersStatus[orderStatus] = (easyOrdersStatus[orderStatus] ?? 0) + 1;

    const shipmentStatus = item.order.shipmentStatus ?? "NO_SHIPMENT";
    bostaStatus[shipmentStatus] = (bostaStatus[shipmentStatus] ?? 0) + 1;
  }

  const timeline = Array.from(byDate.values());

  return ok(
    {
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
      },
      totals: {
        orders: orderItems.length,
        units: timeline.reduce((sum, row) => sum + row.units, 0),
        revenue: timeline.reduce((sum, row) => sum + row.revenue, 0),
        profit: timeline.reduce((sum, row) => sum + row.profit, 0),
      },
      easyOrdersStatus,
      bostaStatus,
      salesTrend: timeline.map((row) => ({
        date: row.date,
        orders: row.orders,
        units: row.units,
        revenue: row.revenue,
      })),
      revenueTrend: timeline.map((row) => ({
        date: row.date,
        revenue: row.revenue,
        profit: row.profit,
      })),
    },
    {
      requestId: auth.requestId,
      source: "DB",
    },
  );
}

export const GET = withAuth(GETHandler, "READ_ONLY");