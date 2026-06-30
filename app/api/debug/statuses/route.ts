import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateBusinessStatus } from "@/services/business-status-engine";

function normalize(value: unknown): string {
  return String(value ?? "NULL").trim() || "NULL";
}

function inc(map: Record<string, number>, key: unknown) {
  const k = normalize(key);
  map[k] = (map[k] ?? 0) + 1;
}

function pickDeep(obj: unknown, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function walk(value: unknown) {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;

    for (const key of keys) {
      if (record[key] != null && result[key] == null) {
        result[key] = record[key];
      }
    }

    for (const child of Object.values(record)) {
      if (child && typeof child === "object") walk(child);
    }
  }

  walk(obj);
  return result;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get("storeId") ?? undefined;
  const days = Number(url.searchParams.get("days") ?? "30");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
  const q = normalize(url.searchParams.get("q") ?? "").toLowerCase();
  const from = new Date(Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000);

  const store = storeId
    ? await prisma.store.findUnique({ where: { id: storeId } })
    : await prisma.store.findFirst();

  if (!store) {
    return NextResponse.json({ success: false, error: "No store found" }, { status: 404 });
  }

  const [orders, providerItems] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId: store.id,
        OR: [
          { orderDate: { gte: from } },
          { updatedAt: { gte: from } },
          { shipment: { is: { updatedAt: { gte: from } } } },
          { shipment: { is: { deliveryDate: { gte: from } } } },
          { shipment: { is: { returnDate: { gte: from } } } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        providerOrderId: true,
        orderDate: true,
        updatedAt: true,
        orderStatus: true,
        shipmentStatus: true,
        customerShippingFee: true,
        orderItems: {
          select: {
            product: { select: { name: true, sku: true } },
            quantity: true,
            unitPrice: true,
          },
        },
        providerOrderItems: {
          select: {
            productName: true,
            sku: true,
            rawPayload: true,
            quantity: true,
            unitPrice: true,
          },
        },
        shipment: {
          select: {
            providerShipmentId: true,
            shipmentStatus: true,
            deliveryDate: true,
            returnDate: true,
            updatedAt: true,
            actualShippingCost: true,
          },
        },
      },
    }),
    prisma.providerOrderItem.findMany({
      where: { storeId: store.id, importedAt: { gte: from } },
      take: 500,
      orderBy: { importedAt: "desc" },
      select: {
        id: true,
        providerOrderId: true,
        productName: true,
        sku: true,
        rawPayload: true,
        importedAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const easyOrderStatusCounts: Record<string, number> = {};
  const orderShipmentStatusCounts: Record<string, number> = {};
  const bostaShipmentStatusCounts: Record<string, number> = {};
  const rawProviderStatusCounts: Record<string, number> = {};
  const rawProviderStateCounts: Record<string, number> = {};
  const rawProviderPaymentCounts: Record<string, number> = {};
  const rawProviderTypeCounts: Record<string, number> = {};
  const businessDeliveredCounts: Record<string, number> = {};

  for (const order of orders) {
    inc(easyOrderStatusCounts, order.orderStatus);
    inc(orderShipmentStatusCounts, order.shipmentStatus);
    inc(bostaShipmentStatusCounts, order.shipment?.shipmentStatus);
  }

  for (const item of providerItems) {
    const picked = pickDeep(item.rawPayload, [
      "status",
      "orderStatus",
      "statusName",
      "state",
      "name",
      "label",
      "paymentStatus",
      "payment_status",
      "type",
      "orderType",
      "shipmentType",
      "operationType",
      "requestType",
    ]);

    inc(rawProviderStatusCounts, picked.status ?? picked.orderStatus ?? picked.statusName ?? picked.name ?? picked.label);
    inc(rawProviderStateCounts, picked.state);
    inc(rawProviderPaymentCounts, picked.paymentStatus ?? picked.payment_status);
    inc(rawProviderTypeCounts, picked.type ?? picked.orderType ?? picked.shipmentType ?? picked.operationType ?? picked.requestType);
  }

  let sampleOrders = orders.map((order) => {
    const firstProviderItem = order.providerOrderItems[0];
    const businessStatus = evaluateBusinessStatus({
      easyOrdersStatus: order.orderStatus,
      orderStatus: order.orderStatus,
      shipmentStatus: order.shipment?.shipmentStatus ?? order.shipmentStatus,
      deliveryDate: order.shipment?.deliveryDate,
      returnDate: order.shipment?.returnDate,
      shipmentUpdatedAt: order.shipment?.updatedAt,
      orderDate: order.orderDate,
      orderUpdatedAt: order.updatedAt,
      rawPayload: firstProviderItem?.rawPayload,
    });

    inc(businessDeliveredCounts, businessStatus.flags.isDelivered ? "DELIVERED_TRUE" : "DELIVERED_FALSE");

    const products = [
      ...order.orderItems.map((item) => ({
        source: "OrderItem",
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      ...order.providerOrderItems.map((item) => ({
        source: "ProviderOrderItem",
        name: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        rawPicked: pickDeep(item.rawPayload, [
          "status",
          "orderStatus",
          "statusName",
          "state",
          "name",
          "label",
          "paymentStatus",
          "payment_status",
          "type",
          "orderType",
          "shipmentType",
          "operationType",
          "requestType",
        ]),
      })),
    ];

    const revenueFromItems = products.reduce((sum, item) => {
      return sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0);
    }, 0);

    return {
      orderId: order.id,
      providerOrderId: order.providerOrderId,
      orderDate: order.orderDate,
      orderUpdatedAt: order.updatedAt,
      easyOrdersStatus: order.orderStatus,
      orderShipmentStatus: order.shipmentStatus,
      bostaShipmentStatus: order.shipment?.shipmentStatus ?? null,
      bostaDeliveryDate: order.shipment?.deliveryDate ?? null,
      bostaReturnDate: order.shipment?.returnDate ?? null,
      bostaUpdatedAt: order.shipment?.updatedAt ?? null,
      shipmentId: order.shipment?.providerShipmentId ?? null,
      actualShippingCost: order.shipment?.actualShippingCost ?? null,
      customerShippingFee: order.customerShippingFee ?? null,
      businessStatus: {
        isDelivered: businessStatus.flags.isDelivered,
        isReturned: businessStatus.flags.isReturned,
        isCancelled: businessStatus.flags.isCancelled,
        isRefused: businessStatus.flags.isRefused,
        isExchange: businessStatus.flags.isExchange,
        revenueEligible: businessStatus.finance.revenueEligible,
        occurredAt: businessStatus.activity.occurredAt,
        easy: businessStatus.easy,
        bosta: businessStatus.bosta,
        raw: businessStatus.raw,
      },
      revenueFromItems,
      products,
    };
  });

  if (q && q !== "null") {
    sampleOrders = sampleOrders.filter((order) =>
      JSON.stringify(order).toLowerCase().includes(q),
    );
  }

  return NextResponse.json({
    success: true,
    store: { id: store.id, name: store.name },
    window: { from, to: new Date(), days },
    counts: {
      easyOrderStatusCounts,
      orderShipmentStatusCounts,
      bostaShipmentStatusCounts,
      rawProviderStatusCounts,
      rawProviderStateCounts,
      rawProviderPaymentCounts,
      rawProviderTypeCounts,
      businessDeliveredCounts,
    },
    sampleOrders,
  });
}
