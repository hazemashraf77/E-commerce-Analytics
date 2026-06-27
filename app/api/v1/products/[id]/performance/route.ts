import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

async function GETHandler(
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string>,
) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const productsIndex = segments.indexOf("products");
  const productId = params?.id ?? segments[productsIndex + 1];

  if (!productId) {
    return validationError("Product id required");
  }

  console.log("PARAMS:", params);
console.log("PATH:", request.nextUrl.pathname);
console.log("PRODUCT ID:", productId);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
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
  });

  const totalUnits = orderItems.reduce((sum, item) => {
    return sum + Number(item.quantity);
  }, 0);

  const revenue = orderItems.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice) - Number(item.discount ?? 0);
  }, 0);

  const deliveredOrders = orderItems.filter(
    (item) => item.order.shipmentStatus === "DELIVERED",
  ).length;

  const returnedOrders = orderItems.filter(
    (item) => item.order.shipmentStatus === "RETURNED",
  ).length;

  const failedOrders = orderItems.filter(
    (item) =>
      item.order.shipmentStatus === "DELIVERY_FAILED" ||
      item.order.shipmentStatus === "CANCELLED",
  ).length;

  const cogs = product.unitProductCost
    ? totalUnits * Number(product.unitProductCost)
    : 0;

  const packaging = product.packagingCost
    ? totalUnits * Number(product.packagingCost)
    : 0;

  const shipping = orderItems.reduce((sum, item) => {
    return sum + Number(item.order.shipment?.actualShippingCost ?? 0);
  }, 0);

  const profit = revenue - cogs - packaging - shipping;

  return ok(
    {
      product,
      summary: {
        ordersCount: orderItems.length,
        totalUnits,
        deliveredOrders,
        returnedOrders,
        failedOrders,
        revenue,
        cogs,
        packaging,
        shipping,
        profit,
        margin: revenue > 0 ? profit / revenue : 0,
      },
    },
    {
      requestId: auth.requestId,
      source: "DB",
    },
  );
}

export const GET = withAuth(GETHandler, "READ_ONLY");