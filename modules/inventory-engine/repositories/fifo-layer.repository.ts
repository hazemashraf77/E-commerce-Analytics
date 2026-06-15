/**
 * FIFO Layer repository.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY LAYER CREATION,
 *             LAYER CONSUMPTION, FIFO TRACEABILITY
 *             006_DATABASE_SPECIFICATION.md — REPOSITORY pattern, HARD DELETE POLICY
 *
 * Rules:
 *  • Hard delete forbidden on inventory layers (006)
 *  • Soft delete via isDeleted (006: SOFT DELETE POLICY)
 *  • Layers returned in FIFO order (purchaseDate ASC) (008: BR-011)
 *  • No cost calculations in repository (ER-001)
 */

import { prisma } from "@/lib/db/prisma";
import type { FifoLayer } from "../domain/inventory.types";
import { IMMUTABLE_LAYER_FIELDS } from "../domain/inventory.rules";
import { AppError } from "@/utils/errors";
import { createLogger } from "@/lib/logger";
import type { Decimal } from "@prisma/client/runtime/library";

const logger = createLogger("FifoLayerRepository");

// ── Create ─────────────────────────────────────────────────────────────────

export interface CreateLayerInput {
  storeId: string;
  productId: string;
  purchaseDate: Date;
  purchaseQuantity: Decimal;
  unitCost: Decimal;
  supplier?: string | null;
  purchaseReference?: string | null;
}

export async function createLayer(input: CreateLayerInput): Promise<FifoLayer> {
  const layer = await prisma.inventoryLayer.create({
    data: {
      storeId: input.storeId,
      productId: input.productId,
      purchaseDate: input.purchaseDate,
      purchaseQuantity: input.purchaseQuantity,
      remainingQuantity: input.purchaseQuantity, // starts full (008)
      unitCost: input.unitCost,
      supplier: input.supplier ?? null,
      purchaseReference: input.purchaseReference ?? null,
    },
  });

  logger.info("FIFO layer created", {
    metadata: { layerId: layer.id, productId: layer.productId, qty: input.purchaseQuantity.toString() },
  });

  return layer as FifoLayer;
}

// ── Read ───────────────────────────────────────────────────────────────────

/** Returns all active layers for a product in FIFO order (oldest first). */
export async function getActiveLayers(
  productId: string,
  storeId: string,
): Promise<FifoLayer[]> {
  const layers = await prisma.inventoryLayer.findMany({
    where: {
      productId,
      storeId,
      isDeleted: false,
      remainingQuantity: { gt: 0 },
    },
    orderBy: { purchaseDate: "asc" }, // FIFO sequence (008: Layer sequence must never change)
  });
  return layers as FifoLayer[];
}

/** Returns ALL layers (including closed) for historical analysis and traceability. */
export async function getAllLayers(
  productId: string,
  storeId: string,
): Promise<FifoLayer[]> {
  const layers = await prisma.inventoryLayer.findMany({
    where: { productId, storeId, isDeleted: false },
    orderBy: { purchaseDate: "asc" },
  });
  return layers as FifoLayer[];
}

export async function getLayerById(layerId: string): Promise<FifoLayer | null> {
  const layer = await prisma.inventoryLayer.findUnique({ where: { id: layerId } });
  return layer as FifoLayer | null;
}

/** All layers for a product across all stores — for full traceability (008: FIFO TRACEABILITY). */
export async function getLayersForStore(storeId: string): Promise<FifoLayer[]> {
  const layers = await prisma.inventoryLayer.findMany({
    where: { storeId, isDeleted: false },
    orderBy: [{ productId: "asc" }, { purchaseDate: "asc" }],
  });
  return layers as FifoLayer[];
}

// ── Update remainingQuantity (ONLY mutable field per 008) ─────────────────

export async function updateLayerRemainingQuantity(
  layerId: string,
  newRemainingQuantity: Decimal,
): Promise<FifoLayer> {
  if (newRemainingQuantity.lessThan(0)) {
    throw new AppError({
      code: "LAYER_NEGATIVE_REMAINING",
      message: `Cannot set layer ${layerId} remainingQuantity to negative value: ${newRemainingQuantity.toString()}`,
      severity: "CRITICAL",
    });
  }

  const updated = await prisma.inventoryLayer.update({
    where: { id: layerId },
    data: { remainingQuantity: newRemainingQuantity },
  });

  logger.debug("Layer remaining quantity updated", {
    metadata: { layerId, newRemaining: newRemainingQuantity.toString() },
  });

  return updated as FifoLayer;
}

// ── Soft delete (006: SOFT DELETE POLICY) ─────────────────────────────────

export async function softDeleteLayer(
  layerId: string,
  deletedBy: string,
): Promise<void> {
  await prisma.inventoryLayer.update({
    where: { id: layerId },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
  });
  logger.warn("FIFO layer soft-deleted", { metadata: { layerId, deletedBy } });
}

// ── Guard: prevent mutation of immutable fields ────────────────────────────

/** Validates that only remainingQuantity is being changed. Used by service layer. */
export function assertOnlyRemainingQuantityChanged(
  updates: Record<string, unknown>,
): void {
  for (const field of IMMUTABLE_LAYER_FIELDS) {
    if (field in updates) {
      throw new AppError({
        code: "LAYER_IMMUTABLE_FIELD_MUTATION",
        message: `Field "${field}" is immutable on a FIFO layer (008_INVENTORY_FIFO_ENGINE.md).`,
        severity: "CRITICAL",
      });
    }
  }
}
