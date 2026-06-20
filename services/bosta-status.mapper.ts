import type { ShipmentStatus } from "@prisma/client";

export interface BostaStatusMapping {
  shipmentStatus: ShipmentStatus;
  isDelivered: boolean;
  isReturned: boolean;
  isCancelled: boolean;
  isTerminal: boolean;
  requiresAttention: boolean;
}

export function mapBostaStatus(stateCode: number, stateValue?: string): BostaStatusMapping {
  const text = String(stateValue ?? "").toLowerCase();

  switch (stateCode) {
    case 10:
      return base("CREATED");

    case 20:
    case 24:
    case 30:
    case 102:
    case 105:
      return base("IN_TRANSIT");

    case 21:
    case 23:
      return base("PICKED_UP");

    case 22:
    case 40:
    case 41:
      return base("OUT_FOR_DELIVERY");

    case 45:
      return {
        ...base("DELIVERED"),
        isDelivered: true,
        isTerminal: true,
      };

    case 46:
    case 60:
      return {
        ...base("RETURNED"),
        isReturned: true,
        isTerminal: true,
      };

    case 47:
    case 103:
      return {
        ...base("DELIVERY_FAILED"),
        requiresAttention: true,
      };

    case 48:
    case 49:
      return {
        ...base("CANCELLED"),
        isCancelled: true,
        isTerminal: true,
      };

    case 100:
    case 101:
      return {
        ...base("DELIVERY_FAILED"),
        isTerminal: true,
        requiresAttention: true,
      };

    default:
      if (text.includes("deliver")) {
        return { ...base("DELIVERED"), isDelivered: true, isTerminal: true };
      }
      if (text.includes("return")) {
        return { ...base("RETURNED"), isReturned: true, isTerminal: true };
      }
      if (text.includes("cancel") || text.includes("terminated")) {
        return { ...base("CANCELLED"), isCancelled: true, isTerminal: true };
      }
      if (text.includes("exception") || text.includes("failed") || text.includes("lost") || text.includes("damaged")) {
        return { ...base("DELIVERY_FAILED"), requiresAttention: true };
      }

      return base("IN_TRANSIT");
  }
}

function base(shipmentStatus: ShipmentStatus): BostaStatusMapping {
  return {
    shipmentStatus,
    isDelivered: false,
    isReturned: false,
    isCancelled: false,
    isTerminal: false,
    requiresAttention: false,
  };
}