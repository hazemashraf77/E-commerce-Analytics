/**
 * GET /api/v1/orders/[orderId]
 * Returns full order detail including financial events (for Order Lookup — 007).
 * "Order Lookup shall display: Revenue, Shipping Subsidy, FIFO Cost, Gross Profit,
 *  Net Profit, Marketing Attribution, Formula Inspector." (007)
 * Auth: READ_ONLY minimum
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const ParamSchema = z.object({ orderId: z.string().uuid() });

async function handler(request: NextRequest, auth: AuthContext, params?: Record<string, string>) {
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) return validationError("Invalid orderId");

  const { orderId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { product: { select: { id: true, sku: true, name: true } } } },
      shipment: { select: { id: true, shipmentStatus: true, deliveryDate: true, actualShippingCost: true, codAmount: true } },
      revenueEvents: true,
      costEvents: true,
      profitEvents: true,
      financialAdjustments: true,
    },
  });

  if (!order) return notFound("Order");

  return ok({ order, requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
