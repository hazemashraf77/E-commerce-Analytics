/**
 * Inventory event bus.
 * Repository: 004_CANONICAL_DATA_MODEL.md — CROSS-MODULE COMMUNICATION
 *             008_INVENTORY_FIFO_ENGINE.md — FIFO ALLOCATION step 7 (Notify Financial Engine)
 *             030_EVENT_SYSTEM.md
 *
 * Events are the only sanctioned communication channel from Inventory Engine
 * to other modules. Financial Engine subscribes to LAYER_CONSUMED to
 * begin cost recognition (no direct call allowed — 004: forbidden flows).
 */

import type {
  InventoryEvent,
  InventoryEventType,
  LayerConsumptionRecord,
} from "./inventory.types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryEvents");

type InventoryEventHandler<T = unknown> = (event: InventoryEvent<T>) => Promise<void> | void;

// ── Simple in-process event bus (production: replace with message queue) ──

const handlers = new Map<InventoryEventType, InventoryEventHandler[]>();

export function onInventoryEvent<T = unknown>(
  type: InventoryEventType,
  handler: InventoryEventHandler<T>,
): void {
  const existing = handlers.get(type) ?? [];
  handlers.set(type, [...existing, handler as InventoryEventHandler]);
}

export async function emitInventoryEvent<T = unknown>(
  event: InventoryEvent<T>,
): Promise<void> {
  logger.debug(`Inventory event emitted: ${event.type}`, {
    metadata: { productId: event.productId, storeId: event.storeId },
  });

  const registered = handlers.get(event.type) ?? [];
  for (const handler of registered) {
    try {
      await handler(event);
    } catch (err) {
      logger.error(`Event handler failed for ${event.type}`, {
        metadata: { error: String(err) },
      });
    }
  }
}

// ── Typed event emitters ───────────────────────────────────────────────────

export function buildInventoryEvent<T>(
  type: InventoryEventType,
  productId: string,
  storeId: string,
  payload: T,
): InventoryEvent<T> {
  return { type, productId, storeId, occurredAt: new Date(), payload };
}

/**
 * Emitted after each FIFO layer consumption.
 * Financial Engine subscribes to this event to record cost (008: step 7).
 * The Financial Engine will read unitCost from the layer — no calculation here.
 */
export type LayerConsumedPayload = LayerConsumptionRecord & {
  layerUnitCost: import("@prisma/client/runtime/library").Decimal;
  layerPurchaseDate: Date;
};
