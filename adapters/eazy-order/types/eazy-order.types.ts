/**
 * EazyOrder provider raw payload types.
 * Repository: 012_API_ARCHITECTURE.md — SUPPORTED PROVIDERS, NORMALIZATION
 *             004_CANONICAL_DATA_MODEL.md — Entity 004, 005
 *
 * These types represent the provider's own format BEFORE canonical conversion.
 * Business Engines never see these types (012: API ADAPTER PRINCIPLES).
 */

export interface EazyOrderRawOrder {
  id: string;                     // provider order ID
  created_at: string;             // ISO string
  status: string;                 // provider-specific status (normalized in mapper)
  payment_method: string;
  customer_shipping_fee: number;
  marketing_source?: string;
  campaign_id?: string;
  items: EazyOrderRawItem[];
}

export interface EazyOrderRawItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

/** Provider-specific statuses that adapters normalize to canonical values */
export const EAZY_ORDER_STATUS_MAP: Record<string, string> = {
  new: "PENDING",
  confirmed: "CONFIRMED",
  processing: "PROCESSING",
  ready: "READY_TO_SHIP",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  closed: "CLOSED",
  draft: "DRAFT",
};
