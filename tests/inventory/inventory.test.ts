/**
 * tests/inventory/inventory.test.ts
 * Sprint 3 — Inventory Foundation tests.
 *
 * Tests domain rules, guards, FIFO ordering, return logic, adjustment guards.
 * No database required — domain logic is pure function testable.
 */

import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

// ── Domain types ───────────────────────────────────────────────────────────

describe("Inventory domain types (008, 004)", () => {
  it("DEFAULT_LOW_STOCK_THRESHOLD is 10", async () => {
    const { DEFAULT_LOW_STOCK_THRESHOLD } = await import(
      "@/modules/inventory-engine/domain/inventory.types"
    );
    expect(DEFAULT_LOW_STOCK_THRESHOLD).toBe(10);
  });

  it("DEFAULT_DEAD_STOCK_DAYS is 90", async () => {
    const { DEFAULT_DEAD_STOCK_DAYS } = await import(
      "@/modules/inventory-engine/domain/inventory.types"
    );
    expect(DEFAULT_DEAD_STOCK_DAYS).toBe(90);
  });
});

// ── FIFO ordering rule (BR-011) ────────────────────────────────────────────

describe("sortLayersFifo (BR-011: FIFO is mandatory)", () => {
  it("sorts layers by purchaseDate ascending — oldest first", async () => {
    const { sortLayersFifo } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );

    const layers = [
      { id: "C", purchaseDate: new Date("2024-03-01"), remainingQuantity: new Decimal(10), isDeleted: false } as any,
      { id: "A", purchaseDate: new Date("2024-01-01"), remainingQuantity: new Decimal(30), isDeleted: false } as any,
      { id: "B", purchaseDate: new Date("2024-02-01"), remainingQuantity: new Decimal(20), isDeleted: false } as any,
    ];

    const sorted = sortLayersFifo(layers);
    expect(sorted[0]!.id).toBe("A");
    expect(sorted[1]!.id).toBe("B");
    expect(sorted[2]!.id).toBe("C");
  });

  it("does not mutate the original array", async () => {
    const { sortLayersFifo } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    const layers = [
      { id: "B", purchaseDate: new Date("2024-02-01"), remainingQuantity: new Decimal(10), isDeleted: false } as any,
      { id: "A", purchaseDate: new Date("2024-01-01"), remainingQuantity: new Decimal(10), isDeleted: false } as any,
    ];
    sortLayersFifo(layers);
    expect(layers[0]!.id).toBe("B"); // original unchanged
  });
});

// ── Negative inventory guard (008: NEGATIVE INVENTORY) ────────────────────

describe("assertSufficientStock (008: negative inventory prohibited)", () => {
  it("passes when available >= requested", async () => {
    const { assertSufficientStock } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertSufficientStock(new Decimal(100), new Decimal(50), "PROD-001"),
    ).not.toThrow();
  });

  it("throws INSUFFICIENT_INVENTORY when available < requested", async () => {
    const { assertSufficientStock } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertSufficientStock(new Decimal(5), new Decimal(10), "PROD-001"),
    ).toThrow("INSUFFICIENT_INVENTORY");
  });

  it("passes exactly at boundary (available === requested)", async () => {
    const { assertSufficientStock } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertSufficientStock(new Decimal(10), new Decimal(10), "PROD-001"),
    ).not.toThrow();
  });
});

// ── Layer state (008: COMPLETE CONSUMPTION) ────────────────────────────────

describe("Layer state guards", () => {
  it("isLayerActive returns true for non-zero remaining", async () => {
    const { isLayerActive } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    const layer = { remainingQuantity: new Decimal(5), isDeleted: false } as any;
    expect(isLayerActive(layer)).toBe(true);
  });

  it("isLayerActive returns false for zero remaining (closed layer)", async () => {
    const { isLayerActive } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    const layer = { remainingQuantity: new Decimal(0), isDeleted: false } as any;
    expect(isLayerActive(layer)).toBe(false);
  });

  it("isLayerClosed returns true when remaining is zero", async () => {
    const { isLayerClosed } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(isLayerClosed({ remainingQuantity: new Decimal(0) } as any)).toBe(true);
  });
});

// ── Available quantity (008: INVENTORY AVAILABILITY) ──────────────────────

describe("computeAvailableQuantity", () => {
  it("sums remainingQuantity of active layers only", async () => {
    const { computeAvailableQuantity } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    const layers = [
      { remainingQuantity: new Decimal(50), isDeleted: false } as any,
      { remainingQuantity: new Decimal(30), isDeleted: false } as any,
      { remainingQuantity: new Decimal(0),  isDeleted: false } as any, // closed
      { remainingQuantity: new Decimal(20), isDeleted: true  } as any, // deleted
    ];
    const available = computeAvailableQuantity(layers);
    expect(available.equals(80)).toBe(true); // 50 + 30 only
  });

  it("returns zero when no active layers", async () => {
    const { computeAvailableQuantity } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(computeAvailableQuantity([]).equals(0)).toBe(true);
  });
});

// ── Stock status (008: PRODUCT STOCK STATUS) ──────────────────────────────

describe("deriveStockStatus", () => {
  it("returns OUT_OF_STOCK when available is zero", async () => {
    const { deriveStockStatus } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(
      deriveStockStatus(new Decimal(0), new Decimal(10), null, null, 90),
    ).toBe("OUT_OF_STOCK");
  });

  it("returns LOW_STOCK when available <= threshold", async () => {
    const { deriveStockStatus } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(
      deriveStockStatus(new Decimal(5), new Decimal(10), null, null, 90),
    ).toBe("LOW_STOCK");
  });

  it("returns DEAD_STOCK when oldest layer age >= deadStockDays", async () => {
    const { deriveStockStatus } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(
      deriveStockStatus(new Decimal(50), new Decimal(10), null, 91, 90),
    ).toBe("DEAD_STOCK");
  });

  it("returns IN_STOCK for healthy inventory", async () => {
    const { deriveStockStatus } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(
      deriveStockStatus(new Decimal(50), new Decimal(10), null, 5, 90),
    ).toBe("IN_STOCK");
  });

  it("returns OVERSTOCK when above overstock threshold", async () => {
    const { deriveStockStatus } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(
      deriveStockStatus(new Decimal(500), new Decimal(10), new Decimal(200), 5, 90),
    ).toBe("OVERSTOCK");
  });
});

// ── Return guards (BR-013, BR-014) ────────────────────────────────────────

describe("assertPhysicalReturn (BR-013: physical return only)", () => {
  it("passes for valid return request", async () => {
    const { assertPhysicalReturn } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertPhysicalReturn({
        orderId: "ORD-001",
        productId: "PROD-001",
        quantity: new Decimal(2),
        originalLayerId: null,
        condition: "GOOD",
      }),
    ).not.toThrow();
  });

  it("throws when orderId is missing (expected return rejected)", async () => {
    const { assertPhysicalReturn } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertPhysicalReturn({
        orderId: "",
        productId: "PROD-001",
        quantity: new Decimal(1),
        originalLayerId: null,
        condition: "GOOD",
      }),
    ).toThrow("RETURN_MISSING_ORDER_REFERENCE");
  });

  it("throws when quantity is zero", async () => {
    const { assertPhysicalReturn } = await import(
      "@/modules/inventory-engine/domain/inventory.rules"
    );
    expect(() =>
      assertPhysicalReturn({
        orderId: "ORD-001",
        productId: "PROD-001",
        quantity: new Decimal(0),
        originalLayerId: null,
        condition: "GOOD",
      }),
    ).toThrow("RETURN_INVALID_QUANTITY");
  });
});

// ── Immutable field guard (BR-015) ────────────────────────────────────────

describe("assertOnlyRemainingQuantityChanged (BR-015: layer immutability)", () => {
  it("throws when immutable field unitCost is in updates", async () => {
    const { assertOnlyRemainingQuantityChanged } = await import(
      "@/modules/inventory-engine/repositories/fifo-layer.repository"
    );
    expect(() =>
      assertOnlyRemainingQuantityChanged({ unitCost: 100 }),
    ).toThrow("LAYER_IMMUTABLE_FIELD_MUTATION");
  });

  it("passes when only remainingQuantity is in updates", async () => {
    const { assertOnlyRemainingQuantityChanged } = await import(
      "@/modules/inventory-engine/repositories/fifo-layer.repository"
    );
    expect(() =>
      assertOnlyRemainingQuantityChanged({ remainingQuantity: new Decimal(5) }),
    ).not.toThrow();
  });
});

// ── Event bus ─────────────────────────────────────────────────────────────

describe("Inventory event bus", () => {
  it("emits and receives LAYER_CREATED event", async () => {
    const { onInventoryEvent, emitInventoryEvent, buildInventoryEvent } = await import(
      "@/modules/inventory-engine/domain/inventory.events"
    );
    const received: unknown[] = [];
    onInventoryEvent("LAYER_CREATED", (e) => { received.push(e); });

    await emitInventoryEvent(
      buildInventoryEvent("LAYER_CREATED", "PROD-001", "STORE-001", { layerId: "L-001" }),
    );

    expect(received).toHaveLength(1);
    expect((received[0] as any).type).toBe("LAYER_CREATED");
  });
});
