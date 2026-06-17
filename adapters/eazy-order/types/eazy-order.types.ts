/**
 * EazyOrder provider raw payload types.
 * Repository: 012_API_ARCHITECTURE.md — SUPPORTED PROVIDERS, NORMALIZATION
 *             004_CANONICAL_DATA_MODEL.md — Entity 004, 005
 */

export interface EazyOrderRawOrder {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  confirmation_status?: string;     // confirmed | unconfirmed | on_hold
  payment_method: string;
  payment_status?: string;
  customer_shipping_fee: number;
  total_price?: number;
  marketing_source?: string;
  campaign_id?: string;
  notes?: string;
  customer_id?: string;
  customer?: EazyOrderRawCustomer;
  shipping_address?: {
    governorate?: string;
    city?: string;
    address?: string;
    phone?: string;
  };
  items: EazyOrderRawItem[];
}

export interface EazyOrderRawItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price?: number;
}

export interface EazyOrderRawProduct {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  cost?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EazyOrderRawCustomer {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  governorate?: string;
}

/** Provider-specific statuses normalized to canonical values */
export const EAZY_ORDER_STATUS_MAP: Record<string, string> = {
  new:             "PENDING",
  pending:         "PENDING",
  confirmed:       "CONFIRMED",
  processing:      "PROCESSING",
  ready:           "READY_TO_SHIP",
  ready_to_ship:   "READY_TO_SHIP",
  shipped:         "SHIPPED",
  in_transit:      "SHIPPED",
  delivered:       "DELIVERED",
  cancelled:       "CANCELLED",
  closed:          "CLOSED",
  draft:           "DRAFT",
  returned:        "RETURNED",
  refunded:        "REFUNDED",
  on_hold:         "ON_HOLD",
};
