import type { ShipmentStatus } from "@prisma/client";

export const INTERNAL_SHIPMENT_STATUS = {
  CREATED: "CREATED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  RETURNED: "RETURNED",
  EXPECTED_RETURN: "EXPECTED_RETURN",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, ShipmentStatus>;

export const TERMINAL_SHIPMENT_STATUSES: ShipmentStatus[] = [
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

export const FAILED_SHIPMENT_STATUSES: ShipmentStatus[] = [
  "DELIVERY_FAILED",
  "EXPECTED_RETURN",
];

export function isDeliveredShipmentStatus(status?: ShipmentStatus | null): boolean {
  return status === "DELIVERED";
}

export function isReturnedShipmentStatus(status?: ShipmentStatus | null): boolean {
  return status === "RETURNED";
}

export function isTerminalShipmentStatus(status?: ShipmentStatus | null): boolean {
  return !!status && TERMINAL_SHIPMENT_STATUSES.includes(status);
}

export function isProblemShipmentStatus(status?: ShipmentStatus | null): boolean {
  return !!status && FAILED_SHIPMENT_STATUSES.includes(status);
}