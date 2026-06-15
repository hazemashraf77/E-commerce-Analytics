/**
 * Inventory purchase service.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY LAYER CREATION,
 *             INVENTORY SOURCES (Purchase, Opening Balance)
 *             002_BUSINESS_RULES.md — BR-015 (every purchase creates one layer)
 *
 * "Every inventory purchase creates a new FIFO layer." (BR-015)
 * No cost calculations here — unitCost is an input, not derived (ER-001).
 */

import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { createLayer } from "../repositories/fifo-layer.repository";
import { recordMovement } from "../repositories/inventory-movement.repository";
import {
  emitInventoryEvent,
  buildInventoryEvent,
} from "../domain/inventory.events";
import type { FifoLayer } from "../domain/inventory.types";
import { AppError } from "@/utils/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryPurchaseService");

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface RecordPurchaseInput {
  storeId: string;
  productId: string;
  purchaseDate: Date;
  quantity: number | string;      // converted to Decimal internally
  unitCost: number | string;      // Decimal(18,4) per 006 MONEY POLICY
  supplier?: string | null;
  purchaseReference?: string | null;
}

export interface RecordOpeningBalanceInput {
  storeId: string;
  productId: string;
  quantity: number | string;
  unitCost: number | string;
  asOfDate: Date;
  notes?: string | null;
}

// ── Service ────────────────────────────────────────────────────────────────

/**
 * Records a new inventory purchase:
 *  1. Creates a FIFO layer (BR-015)
 *  2. Records a PURCHASE movement (immutable)
 *  3. Emits LAYER_CREATED event
 *
 * Wraps both writes in a transaction (006: TRANSACTION POLICY).
 */
export async function recordPurchase(
  input: RecordPurchaseInput,
): Promise<FifoLayer> {
  const qty = new Decimal(input.quantity);
  const cost = new Decimal(input.unitCost);

  if (qty.lessThanOrEqualTo(0)) {
    throw new AppError({
      code: "PURCHASE_INVALID_QUANTITY",
      message: "Purchase quantity must be greater than zero.",
      severity: "HIGH",
    });
  }
  if (cost.lessThanOrEqualTo(0)) {
    throw new AppError({
      code: "PURCHASE_INVALID_UNIT_COST",
      message: "Purchase unit cost must be greater than zero.",
      severity: "HIGH",
    });
  }

  logger.info("Recording inventory purchase", {
    metadata: { productId: input.productId, qty: qty.toString(), cost: cost.toString() },
  });

  const result = await prisma.$transaction(async () => {
    const layer = await createLayer({
      storeId: input.storeId,
      productId: input.productId,
      purchaseDate: input.purchaseDate,
      purchaseQuantity: qty,
      unitCost: cost,
      supplier: input.supplier,
      purchaseReference: input.purchaseReference,
    });

    await recordMovement({
      productId: input.productId,
      layerId: layer.id,
      movementType: "PURCHASE",
      quantity: qty,
      unitCost: cost,
      occurredAt: input.purchaseDate,
    });

    return layer;
  });

  await emitInventoryEvent(
    buildInventoryEvent("LAYER_CREATED", input.productId, input.storeId, {
      layerId: result.id,
      quantity: qty.toString(),
    }),
  );

  return result;
}

/**
 * Records an opening balance as a FIFO layer.
 * Opening Balance is a valid inventory source (008: INVENTORY SOURCES).
 */
export async function recordOpeningBalance(
  input: RecordOpeningBalanceInput,
): Promise<FifoLayer> {
  const qty = new Decimal(input.quantity);
  const cost = new Decimal(input.unitCost);

  const result = await prisma.$transaction(async () => {
    const layer = await createLayer({
      storeId: input.storeId,
      productId: input.productId,
      purchaseDate: input.asOfDate,
      purchaseQuantity: qty,
      unitCost: cost,
      supplier: null,
      purchaseReference: input.notes ?? "OPENING_BALANCE",
    });

    await recordMovement({
      productId: input.productId,
      layerId: layer.id,
      movementType: "OPENING_BALANCE",
      quantity: qty,
      unitCost: cost,
      occurredAt: input.asOfDate,
    });

    return layer;
  });

  logger.info("Opening balance recorded", {
    metadata: { productId: input.productId, qty: qty.toString() },
  });

  return result;
}
