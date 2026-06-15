/**
 * Business event generation scaffold.
 * Repository: 074_DATA_ARCHITECTURE_BIBLE.md — BUSINESS EVENT MODEL
 *             073_API_INTEGRATION_BIBLE.md — Business Event Engine
 *
 * "Every business action generates one immutable Business Event." (074)
 * "Business Events are append-only. They are never edited." (074)
 *
 * This scaffold defines event types and the generation contract.
 * Full implementation wires into the Financial Engine pipeline.
 */

export type BusinessEventType =
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "ORDER_RETURNED"
  | "ORDER_REFUSED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_PICKED"
  | "SHIPMENT_IN_TRANSIT"
  | "SHIPMENT_DELIVERED"
  | "SHIPMENT_RETURNED"
  | "SHIPMENT_REFUSED"
  | "SETTLEMENT_RECEIVED"
  | "CAMPAIGN_CREATED"
  | "CAMPAIGN_UPDATED"
  | "SPEND_RECORDED"
  | "INVENTORY_PURCHASED"
  | "INVENTORY_CONSUMED"
  | "FINANCIAL_ADJUSTMENT_ADDED";

export interface BusinessEvent {
  /** Immutable event ID */
  id: string;
  type: BusinessEventType;
  /** Internal entity this event belongs to */
  entityId: string;
  entityType: "ORDER" | "SHIPMENT" | "SETTLEMENT" | "CAMPAIGN" | "INVENTORY";
  storeId: string;
  /** Source provider that triggered this event */
  sourceProvider: string;
  /** External ID from provider */
  externalId?: string;
  /** ISO timestamp — immutable once set */
  occurredAt: string;
  importedAt: string;
  /** Immutable payload snapshot */
  payload: Record<string, unknown>;
  /** Sync batch that produced this event */
  syncBatchId?: string;
}

/**
 * Factory: build a business event from a sync result.
 * Generates the event structure; persistence happens in the sync engine.
 */
export function buildBusinessEvent(
  type: BusinessEventType,
  entityId: string,
  entityType: BusinessEvent["entityType"],
  storeId: string,
  sourceProvider: string,
  payload: Record<string, unknown>,
  options?: { externalId?: string; occurredAt?: string; syncBatchId?: string },
): BusinessEvent {
  return {
    id: crypto.randomUUID(),
    type,
    entityId,
    entityType,
    storeId,
    sourceProvider,
    externalId: options?.externalId,
    occurredAt: options?.occurredAt ?? new Date().toISOString(),
    importedAt: new Date().toISOString(),
    payload,
    syncBatchId: options?.syncBatchId,
  };
}

/**
 * Map EasyOrders order status to a business event type.
 * Repository: 073 — Business Event Generation
 */
export function orderStatusToEventType(status: string): BusinessEventType | null {
  const map: Record<string, BusinessEventType> = {
    PENDING:        "ORDER_CREATED",
    CONFIRMED:      "ORDER_CONFIRMED",
    READY_TO_SHIP:  "ORDER_SHIPPED",
    DELIVERED:      "ORDER_DELIVERED",
    CANCELLED:      "ORDER_CANCELLED",
    RETURNED:       "ORDER_RETURNED",
    DELIVERY_FAILED:"ORDER_REFUSED",
  };
  return map[status] ?? null;
}

/**
 * Map Bosta shipment status to a business event type.
 */
export function shipmentStatusToEventType(status: string): BusinessEventType | null {
  const map: Record<string, BusinessEventType> = {
    CREATED:            "SHIPMENT_CREATED",
    PICKED_UP:          "SHIPMENT_PICKED",
    IN_TRANSIT:         "SHIPMENT_IN_TRANSIT",
    OUT_FOR_DELIVERY:   "SHIPMENT_IN_TRANSIT",
    DELIVERED:          "SHIPMENT_DELIVERED",
    RETURNED:           "SHIPMENT_RETURNED",
    DELIVERY_FAILED:    "SHIPMENT_REFUSED",
    EXPECTED_RETURN:    "SHIPMENT_RETURNED",
  };
  return map[status] ?? null;
}
