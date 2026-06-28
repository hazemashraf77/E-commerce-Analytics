import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { paginated, validationError } from "@/lib/api/response";
import { OrderListQuerySchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/db/prisma";

async function handler(request: NextRequest, _auth: AuthContext) {
  const parsed = OrderListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success)
    return validationError("Invalid parameters", { issues: parsed.error.issues });

  const { storeId, page, pageSize, from, to, status, sortBy, sortDirection } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where = {
    storeId,
    ...(status ? { orderStatus: status } : {}),
    ...(from || to
      ? {
          orderDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortDirection },
      select: {
        id: true,
        providerOrderId: true,
        provider: true,
        orderDate: true,
        orderStatus: true,
        shipmentStatus: true,
        paymentStatus: true,
        customerShippingFee: true,
        marketingSource: true,
        importedAt: true,
        shipment: {
          select: {
            providerShipmentId: true,
            shipmentStatus: true,
            actualShippingCost: true,
            codAmount: true,
            deliveryDate: true,
            returnDate: true,
            syncedAt: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            discount: true,
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const rows = orders.map((order) => {
    const itemsTotal = order.orderItems.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0);
    }, 0);

    return {
      id: order.id,
      providerOrderId: order.providerOrderId,
      provider: order.provider,
      orderDate: order.orderDate,
      easyOrdersStatus: order.orderStatus,
      orderShipmentStatus: order.shipmentStatus,
      bostaStatus: order.shipment?.shipmentStatus ?? order.shipmentStatus ?? null,
      trackingNumber: order.shipment?.providerShipmentId ?? null,
      paymentStatus: order.paymentStatus,
      customerShippingFee: order.customerShippingFee,
      revenue: itemsTotal + Number(order.customerShippingFee ?? 0),
      itemsCount: order.orderItems.length,
      products: order.orderItems.map((item) => ({
        productId: item.product?.id ?? null,
        name: item.product?.name ?? "Unmapped product",
        sku: item.product?.sku ?? "—",
        quantity: Number(item.quantity),
      })),
      shipment: order.shipment,
    };
  });

  return paginated(rows, page, pageSize, total);
}

export const GET = withAuth(handler, "READ_ONLY");
