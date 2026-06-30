/**
 * Business Status Engine
 *
 * The only place that translates provider/order/shipment state into business states.
 * Homepage, Finance, Reports, Decision Center and future Ads integrations should use this
 * instead of checking raw provider statuses directly.
 *
 * Fix note:
 * - Bosta delivery evidence overrides EasyOrders CANCELLED when the shipment is actually delivered.
 * - This handles real cases where EasyOrders remains CANCELLED/PENDING but Bosta has DELIVERED.
 */

export type BusinessOperationType = "DELIVERY" | "RETURN" | "EXCHANGE" | "UNKNOWN";

export interface BusinessStatusInput {
  easyOrdersStatus?: unknown;
  orderStatus?: unknown;
  shipmentStatus?: unknown;
  deliveryDate?: Date | string | null;
  returnDate?: Date | string | null;
  shipmentUpdatedAt?: Date | string | null;
  orderDate?: Date | string | null;
  orderUpdatedAt?: Date | string | null;
  rawPayload?: unknown;
}

export interface BusinessStatusResult {
  easy: {
    new: boolean;
    confirmed: boolean;
    processing: boolean;
    readyToShip: boolean;
    sentToBosta: boolean;
    delivered: boolean;
    cancelled: boolean;
    spam: boolean;
    needsReview: boolean;
  };
  bosta: {
    new: boolean;
    received: boolean;
    inTransit: boolean;
    outForDelivery: boolean;
    delivered: boolean;
    refused: boolean;
    returnRequested: boolean;
    returnCompleted: boolean;
    exchangeRequested: boolean;
    exchangeCompleted: boolean;
    cancelled: boolean;
    problem: boolean;
    lost: boolean;
  };
  finance: {
    revenueEligible: boolean;
    outboundShippingEligible: boolean;
    returnShippingEligible: boolean;
  };
  activity: {
    occurredAt: Date | null;
    orderDate: Date | null;
    deliveryDate: Date | null;
    returnDate: Date | null;
    updatedAt: Date | null;
  };
  flags: {
    isDelivered: boolean;
    isReturned: boolean;
    isCancelled: boolean;
    isRefused: boolean;
    isExchange: boolean;
    isProblem: boolean;
  };
  raw: {
    easyStatus: string;
    shipmentStatus: string;
    operationType: BusinessOperationType;
  };
}

export function normalizeStatus(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s\-]+/g, "_");
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function hasDate(value: unknown): boolean {
  return toDate(value) != null;
}

function extractJsonString(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== "object") return null;
  const obj = source as Record<string, unknown>;

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const nested = extractJsonString(value, keys);
      if (nested) return nested;
    }
  }

  return null;
}

export function getOperationType(rawPayload?: unknown, shipmentStatusRaw?: unknown): BusinessOperationType {
  const rawType = normalizeStatus(
    extractJsonString(rawPayload, [
      "type",
      "orderType",
      "shipmentType",
      "businessType",
      "operationType",
      "requestType",
      "deliveryType",
      "serviceType",
      "returnType",
      "exchangeType",
    ]) ?? shipmentStatusRaw,
  );

  if (rawType.includes("EXCHANGE") || rawType.includes("استبدال")) return "EXCHANGE";
  if (rawType.includes("RETURN") || rawType.includes("REFUND") || rawType.includes("استرجاع") || rawType.includes("مرتجع")) return "RETURN";
  if (rawType.includes("DELIVERY") || rawType.includes("NORMAL") || rawType.includes("توصيل")) return "DELIVERY";

  return "UNKNOWN";
}

function maxDate(...values: Array<Date | null>): Date | null {
  const dates = values.filter(Boolean) as Date[];
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function evaluateBusinessStatus(input: BusinessStatusInput): BusinessStatusResult {
  const easyStatus = normalizeStatus(input.easyOrdersStatus ?? input.orderStatus);
  const shipmentStatus = normalizeStatus(input.shipmentStatus);
  const operationType = getOperationType(input.rawPayload, input.shipmentStatus);

  const orderDate = toDate(input.orderDate);
  const sourceDeliveryDate = toDate(input.deliveryDate);
  const returnDate = toDate(input.returnDate);
  const updatedAt = maxDate(toDate(input.shipmentUpdatedAt), toDate(input.orderUpdatedAt));

  const easyDelivered = easyStatus === "DELIVERED" || easyStatus === "CLOSED";
  const easyCancelled = easyStatus === "CANCELLED" || easyStatus === "CANCELED";

  const statusDelivered = ["DELIVERED", "SUCCESS", "SUCCESSFUL", "COMPLETED", "DONE", "تم_بنجاح"].includes(shipmentStatus);
  const statusReturned = ["RETURNED", "EXPECTED_RETURN", "RETURN_IN_PROGRESS"].includes(shipmentStatus);
  const statusRefused = ["DELIVERY_FAILED", "REFUSED", "REJECTED"].includes(shipmentStatus);
  const statusExchange = ["EXCHANGE", "EXCHANGED", "EXCHANGE_REQUESTED"].includes(shipmentStatus);
  const statusProblem = ["EXCEPTION", "ON_HOLD", "FAILED", "PROBLEM"].includes(shipmentStatus);

  const returnCompleted = hasDate(returnDate) || (statusDelivered && operationType === "RETURN");
  const exchangeCompleted = statusDelivered && operationType === "EXCHANGE";

  // Bosta / shipment evidence is stronger than EasyOrders status.
  // Some real orders stay CANCELLED/PENDING in EasyOrders while Bosta says DELIVERED.
  const delivered =
    !returnCompleted &&
    !exchangeCompleted &&
    (hasDate(sourceDeliveryDate) || easyDelivered || statusDelivered);

  const deliveryDate = sourceDeliveryDate ?? (delivered ? updatedAt : null);
  const occurredAt = maxDate(returnDate, deliveryDate, updatedAt, orderDate);

  const bostaCancelled = shipmentStatus === "CANCELLED" || shipmentStatus === "CANCELED";

  const easy = {
    // Based on real debug values: PENDING / CONFIRMED / DELIVERED / CANCELLED.
    // PENDING in your current EasyOrders imported data behaves like "under review/new".
    new:
      easyStatus === "PENDING" ||
      easyStatus === "NEW" ||
      easyStatus === "DRAFT" ||
      easyStatus.includes("UNDER_REVIEW") ||
      easyStatus.includes("REVIEW") ||
      easyStatus.includes("تحت_المراجعة"),
    confirmed: easyStatus === "CONFIRMED",
    processing: easyStatus === "PROCESSING",
    readyToShip: easyStatus === "READY_TO_SHIP" || easyStatus === "READY_FOR_SHIPPING",
    sentToBosta:
      easyStatus === "SHIPPED" ||
      easyStatus === "SENT_TO_BOSTA" ||
      easyStatus === "DELIVERY_IN_PROGRESS" ||
      easyStatus.includes("قيد_التوصيل"),
    delivered: easyDelivered,
    // EasyOrders cancellation is ignored when Bosta/shipment has real delivery/return/exchange evidence.
    cancelled: easyCancelled && !delivered && !returnCompleted && !exchangeCompleted,
    spam: easyStatus === "SPAM",
    needsReview:
      easyStatus === "PAYMENT_FAILED" ||
      easyStatus === "FAILED_PAYMENT" ||
      easyStatus.includes("NO_ANSWER") ||
      easyStatus.includes("CUSTOMER_NOT_RESPONDING") ||
      easyStatus.includes("فشل_الدفع"),
  };

  const bosta = {
    new: shipmentStatus === "CREATED" || shipmentStatus === "NEW",
    received: ["PICKED_UP", "PICKED", "PICKEDUP", "RECEIVED", "AT_HUB", "IN_HUB"].includes(shipmentStatus),
    inTransit: shipmentStatus === "IN_TRANSIT" || shipmentStatus === "TRANSIT",
    outForDelivery: shipmentStatus === "OUT_FOR_DELIVERY" || shipmentStatus === "OFD",
    delivered,
    refused: statusRefused,
    returnRequested: statusReturned && !returnCompleted,
    returnCompleted,
    exchangeRequested: statusExchange && !exchangeCompleted,
    exchangeCompleted,
    cancelled: bostaCancelled && !delivered && !returnCompleted && !exchangeCompleted,
    problem: statusProblem,
    lost: shipmentStatus === "LOST",
  };

  const isCancelled = easy.cancelled || bosta.cancelled;
  const isReturned = bosta.returnRequested || bosta.returnCompleted;
  const isExchange = bosta.exchangeRequested || bosta.exchangeCompleted;
  const isRefused = bosta.refused;
  const isDelivered = bosta.delivered;

  return {
    easy,
    bosta,
    finance: {
      revenueEligible: isDelivered && !isReturned && !isCancelled,
      outboundShippingEligible: isDelivered || isRefused || isReturned || isExchange || Boolean(shipmentStatus),
      returnShippingEligible: isReturned,
    },
    activity: {
      occurredAt,
      orderDate,
      deliveryDate,
      returnDate,
      updatedAt,
    },
    flags: {
      isDelivered,
      isReturned,
      isCancelled,
      isRefused,
      isExchange,
      isProblem: bosta.problem || bosta.lost || easy.needsReview,
    },
    raw: {
      easyStatus,
      shipmentStatus,
      operationType,
    },
  };
}

export function isBusinessActivityInRange(status: BusinessStatusResult, from: Date, to: Date): boolean {
  const occurredAt = status.activity.occurredAt;
  if (!occurredAt) return false;
  return occurredAt >= from && occurredAt <= to;
}
