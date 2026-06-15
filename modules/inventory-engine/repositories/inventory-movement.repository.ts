/**
 * Inventory Movement repository.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY MOVEMENT HISTORY (immutable)
 *             004_CANONICAL_DATA_MODEL.md — Entity 008
 *             006_DATABASE_SPECIFICATION.md — HARD DELETE POLICY (inventory immutable)
 *
 * Movements are append-only. No update or delete operations exist here.
 * "Inventory history is immutable." (008)
 */

import { prisma } from "@/lib/db/prisma";
import type { InventoryMovement } from "../domain/inventory.types";
import type { InventoryMovementType } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryMovementRepository");

// ── Create (append-only) ───────────────────────────────────────────────────

export interface CreateMovementInput {
  productId: string;
  layerId?: string | null;
  movementType: InventoryMovementType;
  quantity: Decimal;
  unitCost: Decimal;
  orderItemId?: string | null;
  relatedOrderId?: string | null;
  occurredAt: Date;
}

export async function recordMovement(input: CreateMovementInput): Promise<InventoryMovement> {
  const movement = await prisma.inventoryMovement.create({
    data: {
      productId: input.productId,
      layerId: input.layerId ?? null,
      movementType: input.movementType,
      quantity: input.quantity,
      unitCost: input.unitCost,
      orderItemId: input.orderItemId ?? null,
      relatedOrderId: input.relatedOrderId ?? null,
      occurredAt: input.occurredAt,
    },
  });

  logger.info("Inventory movement recorded", {
    metadata: {
      movementId: movement.id,
      productId: input.productId,
      type: input.movementType,
      qty: input.quantity.toString(),
    },
  });

  return movement as InventoryMovement;
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getMovementsForProduct(
  productId: string,
  options?: { since?: Date; until?: Date; types?: InventoryMovementType[] },
): Promise<InventoryMovement[]> {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      productId,
      ...(options?.since || options?.until
        ? { occurredAt: { gte: options.since, lte: options.until } }
        : {}),
      ...(options?.types ? { movementType: { in: options.types } } : {}),
    },
    orderBy: { occurredAt: "asc" },
  });
  return movements as InventoryMovement[];
}

export async function getMovementsForLayer(layerId: string): Promise<InventoryMovement[]> {
  const movements = await prisma.inventoryMovement.findMany({
    where: { layerId },
    orderBy: { occurredAt: "asc" },
  });
  return movements as InventoryMovement[];
}

export async function getMovementsForOrder(orderId: string): Promise<InventoryMovement[]> {
  const movements = await prisma.inventoryMovement.findMany({
    where: {
      OR: [
        { relatedOrderId: orderId },
        { orderItem: { orderId } },
      ],
    },
    orderBy: { occurredAt: "asc" },
  });
  return movements as InventoryMovement[];
}

export async function getMovementById(movementId: string): Promise<InventoryMovement | null> {
  const m = await prisma.inventoryMovement.findUnique({ where: { id: movementId } });
  return m as InventoryMovement | null;
}

/** Returns all SALE movements for an order item — used for FIFO traceability (008). */
export async function getSaleMovementsForOrderItem(
  orderItemId: string,
): Promise<InventoryMovement[]> {
  const movements = await prisma.inventoryMovement.findMany({
    where: { orderItemId, movementType: "SALE" },
    orderBy: { occurredAt: "asc" },
  });
  return movements as InventoryMovement[];
}
