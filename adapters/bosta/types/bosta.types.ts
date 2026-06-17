/**
 * Bosta provider raw payload types.
 * Repository: 004_CANONICAL_DATA_MODEL.md — Entity 006 (Shipment), Entity 010 (Settlement)
 *             005_SOURCE_OF_TRUTH_MATRIX.md — Actual Shipping Cost → Bosta
 */

export interface BostaRawShipment {
  _id: string;
  trackingNumber?: string;
  order_id?: string;          // merchant reference ID (maps to EasyOrders order ID)
  businessReference?: string; // alternative reference field Bosta uses
  type?: number;              // 10=deliver, 20=pick+deliver, 25=customer return, 30=exchange, 35=cash collect
  state: number | string;
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
  zone?: string;
  specs?: {
    packageDetails?: { weight?: number };
  };
  receiver?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: { name?: string; nameAr?: string };
    district?: string;
    buildingNumber?: string;
  };
  dropOffAddress?: {
    city?: { name?: string };
    district?: string;
  };
  pricing: {
    total: number;           // actual shipping cost (Source of Truth)
    cod?: number;
    cod_amount?: number;
    cashOnDelivery?: number; // Bosta may use different field names across API versions
    codFees?: number;
  };
  delivery_date?: string;
  return_date?: string;
  timeline?: BostaTrackingEvent[];
  exchangeOrder?: {
    _id?: string;
    trackingNumber?: string;
  };
}

export interface BostaTrackingEvent {
  state: number | string;
  timestamp: string;
  hub?: string;
  reason?: string;
  code?: string;
  exception?: string;
}

export interface BostaRawSettlement {
  settlement_id: string;
  _id?: string;
  date: string;
  cycle_start?: string;
  cycle_end?: string;
  expected_amount: number;
  actual_amount: number;
  charges: {
    shipping: number;
    returns: number;
    exchanges: number;
    additional: number;
  };
  net_transfer: number;
  status?: string;
  bank_details?: {
    bank_name?: string;
    account_number?: string;
    iban?: string;
  };
  deliveries_count?: number;
  returns_count?: number;
}

/** Bosta state normalization — numeric states per Bosta API docs */
export const BOSTA_STATE_MAP: Record<string | number, string> = {
  10:  "CREATED",
  20:  "PICKED_UP",
  30:  "IN_TRANSIT",
  40:  "OUT_FOR_DELIVERY",
  41:  "OUT_FOR_DELIVERY",
  45:  "DELIVERY_FAILED",      // refused or failed attempt
  47:  "EXPECTED_RETURN",      // on its way back
  49:  "DELIVERY_FAILED",
  60:  "DELIVERED",
  65:  "DELIVERED",            // delivered then customer initiated return
  70:  "RETURNED",
  75:  "RETURNED",
  80:  "CANCELLED",
  // String versions (some API responses use text)
  Created:             "CREATED",
  "Picked Up":         "PICKED_UP",
  "In Transit":        "IN_TRANSIT",
  "Out for Delivery":  "OUT_FOR_DELIVERY",
  Delivered:           "DELIVERED",
  "Delivery Failed":   "DELIVERY_FAILED",
  Returned:            "RETURNED",
  Cancelled:           "CANCELLED",
  "Expected Return":   "EXPECTED_RETURN",
};

/** Map canonical ShipmentStatus back to dashboard display label */
export const SHIPMENT_DISPLAY_MAP: Record<string, { en: string; ar: string }> = {
  CREATED:          { en: "Created",              ar: "تم الإنشاء" },
  PICKED_UP:        { en: "Picked Up",            ar: "تم الاستلام" },
  IN_TRANSIT:       { en: "In Transit",           ar: "في الطريق" },
  OUT_FOR_DELIVERY: { en: "Out for Delivery",     ar: "خرج للتسليم" },
  DELIVERED:        { en: "Delivered",            ar: "تم التسليم" },
  DELIVERY_FAILED:  { en: "Refused",              ar: "مرفوض" },
  EXPECTED_RETURN:  { en: "Returning to Us",      ar: "مرتجعاتك العائدة" },
  RETURNED:         { en: "Returned to Warehouse",ar: "تم الاسترجاع" },
  CANCELLED:        { en: "Cancelled",            ar: "ملغي" },
};
