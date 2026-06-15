/**
 * Bosta provider raw payload types.
 * Repository: 004_CANONICAL_DATA_MODEL.md — Entity 006 (Shipment), Entity 010 (Settlement)
 *             005_SOURCE_OF_TRUTH_MATRIX.md — Actual Shipping Cost → Bosta
 */

export interface BostaRawShipment {
  _id: string;                    // Bosta shipment ID
  order_id: string;               // references EazyOrder provider order ID
  state: number | string;         // Bosta uses numeric/string states — normalized in mapper
  zone: string;
  delivery_date?: string;
  return_date?: string;
  pricing: {
    total: number;                // actual shipping cost (SoT: Bosta)
    cod_amount: number;
  };
}

export interface BostaRawSettlement {
  settlement_id: string;
  date: string;
  expected_amount: number;
  actual_amount: number;
  charges: {
    shipping: number;
    returns: number;
    exchanges: number;
    additional: number;
  };
  net_transfer: number;
}

/** Bosta state normalization (012: NORMALIZATION — provider statuses) */
export const BOSTA_STATE_MAP: Record<string | number, string> = {
  10: "CREATED",
  20: "PICKED_UP",
  30: "IN_TRANSIT",
  40: "OUT_FOR_DELIVERY",
  45: "DELIVERY_FAILED",
  47: "EXPECTED_RETURN",
  60: "DELIVERED",
  70: "RETURNED",
  80: "CANCELLED",
  Created: "CREATED",
  "Picked Up": "PICKED_UP",
  "In Transit": "IN_TRANSIT",
  "Out for Delivery": "OUT_FOR_DELIVERY",
  Delivered: "DELIVERED",
  Returned: "RETURNED",
  Cancelled: "CANCELLED",
};
