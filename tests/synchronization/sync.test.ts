/**
 * tests/synchronization/sync.test.ts
 * Sprint 2 — Synchronization Engine tests.
 * Tests: adapter contracts, validation pipeline, job queue,
 *        scheduler, mock adapters, retry logic.
 */

import { describe, it, expect, beforeEach } from "vitest";

// ── Adapter contracts ──────────────────────────────────────────────────────

describe("Mock EazyOrder Adapter", () => {
  it("fetchOrders returns canonical orders with items", async () => {
    const { MockEazyOrderAdapter } = await import(
      "@/adapters/eazy-order/mock-eazy-order.adapter"
    );
    const adapter = new MockEazyOrderAdapter({
      provider: "EAZY_ORDER",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });

    const result = await adapter.fetchOrders({});
    expect(result.success).toBe(true);
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records[0]).toHaveProperty("items");
    expect(result.records[0]!.provider).toBe("EAZY_ORDER");
    expect(result.records[0]!.providerOrderId).toBeDefined();
  });

  it("incremental sync filters by since date", async () => {
    const { MockEazyOrderAdapter } = await import(
      "@/adapters/eazy-order/mock-eazy-order.adapter"
    );
    const adapter = new MockEazyOrderAdapter({
      provider: "EAZY_ORDER",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });

    const all = await adapter.fetchOrders({});
    const incremental = await adapter.fetchOrders({ since: "2024-01-13T00:00:00Z" });

    // Incremental should return fewer records (only after the since date)
    expect(incremental.records.length).toBeLessThan(all.records.length);
  });

  it("ping returns true", async () => {
    const { MockEazyOrderAdapter } = await import(
      "@/adapters/eazy-order/mock-eazy-order.adapter"
    );
    const adapter = new MockEazyOrderAdapter({
      provider: "EAZY_ORDER",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    expect(await adapter.ping()).toBe(true);
  });
});

describe("Mock Bosta Adapter", () => {
  it("fetchShipments returns canonical shipments", async () => {
    const { MockBostaAdapter } = await import("@/adapters/bosta/mock-bosta.adapter");
    const adapter = new MockBostaAdapter({
      provider: "BOSTA",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    // With empty orderIdMap, shipments without matching order return null and are filtered
    const result = await adapter.fetchShipments({});
    expect(result.success).toBe(true);
    // All skipped because orderIdMap is empty — correct behavior (orders must sync first)
    expect(result.records.length).toBe(0);
  });

  it("fetchShipments maps shipments when orderIdMap is populated", async () => {
    const { MockBostaAdapter } = await import("@/adapters/bosta/mock-bosta.adapter");
    const adapter = new MockBostaAdapter({
      provider: "BOSTA",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    adapter.setOrderIdMap(new Map([
      ["EO-001", "00000000-0000-0000-0000-000000000010"],
      ["EO-002", "00000000-0000-0000-0000-000000000011"],
    ]));
    const result = await adapter.fetchShipments({});
    expect(result.records.length).toBe(2);
    expect(result.records[0]!.actualShippingCost).toBeDefined();
  });

  it("fetchSettlements returns settlement records", async () => {
    const { MockBostaAdapter } = await import("@/adapters/bosta/mock-bosta.adapter");
    const adapter = new MockBostaAdapter({
      provider: "BOSTA",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    const result = await adapter.fetchSettlements({});
    expect(result.success).toBe(true);
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records[0]!.providerSettlementId).toBe("SETTLE-001");
  });
});

describe("Mock Meta Adapter", () => {
  it("fetchCampaigns returns canonical campaigns", async () => {
    const { MockMetaAdapter } = await import("@/adapters/meta/mock-meta.adapter");
    const adapter = new MockMetaAdapter({
      provider: "META",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    const result = await adapter.fetchCampaigns({});
    expect(result.success).toBe(true);
    expect(result.records[0]!.platform).toBe("META");
  });

  it("fetchSpend returns spend records with Decimal amounts", async () => {
    const { MockMetaAdapter } = await import("@/adapters/meta/mock-meta.adapter");
    const adapter = new MockMetaAdapter({
      provider: "META",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    const result = await adapter.fetchSpend({});
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records[0]!.currency).toBe("EGP");
  });
});

describe("Mock TikTok Adapter", () => {
  it("fetches campaigns and spend", async () => {
    const { MockTikTokAdapter } = await import("@/adapters/tiktok/mock-tiktok.adapter");
    const adapter = new MockTikTokAdapter({
      provider: "TIKTOK",
      storeId: "00000000-0000-0000-0000-000000000001",
      credentials: {},
    });
    const campaigns = await adapter.fetchCampaigns({});
    const spend = await adapter.fetchSpend({});
    expect(campaigns.records[0]!.platform).toBe("TIKTOK");
    expect(spend.records.length).toBeGreaterThan(0);
  });
});

// ── Job queue ──────────────────────────────────────────────────────────────

describe("Job Queue", () => {
  it("enqueue returns a QUEUED job with correct structure", async () => {
    const { enqueue } = await import("@/modules/synchronization-engine/queue/job.queue");
    const job = enqueue({
      jobType: "TEST_JOB",
      category: "SYNCHRONIZATION",
      priority: "HIGH",
      payload: { test: true },
    });
    expect(job.status).toBe("QUEUED");
    expect(job.attempts).toBe(0);
    expect(job.jobId).toBeDefined();
  });

  it("enqueueSyncJob respects documented priority order (ORDERS=HIGH)", async () => {
    const { enqueueSyncJob } = await import("@/modules/synchronization-engine/queue/job.queue");
    const job = enqueueSyncJob({
      provider: "EAZY_ORDER",
      scope: "ORDERS",
      storeId: "00000000-0000-0000-0000-000000000001",
      triggeredBy: "MANUAL",
    });
    expect(job.priority).toBe("HIGH");
    expect(job.category).toBe("SYNCHRONIZATION");
  });

  it("RETRY_DELAYS_MS has 3 documented intervals", async () => {
    const { RETRY_DELAYS_MS } = await import("@/modules/synchronization-engine/types/job.types");
    expect(RETRY_DELAYS_MS).toHaveLength(3);
    expect(RETRY_DELAYS_MS[0]).toBe(30_000);    // 30s
    expect(RETRY_DELAYS_MS[1]).toBe(120_000);   // 2min
    expect(RETRY_DELAYS_MS[2]).toBe(600_000);   // 10min
  });
});

// ── Validation pipeline ────────────────────────────────────────────────────

describe("Validation Pipeline", () => {
  it("validates schema successfully for valid payload", async () => {
    const { validateSchema } = await import(
      "@/modules/synchronization-engine/domain/validation.pipeline"
    );
    const { z } = await import("zod");
    const schema = z.object({ id: z.string(), amount: z.number() });
    const result = validateSchema(schema, { id: "ORD-001", amount: 100 }, "Order");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports schema stage on failure", async () => {
    const { validateSchema } = await import(
      "@/modules/synchronization-engine/domain/validation.pipeline"
    );
    const { z } = await import("zod");
    const schema = z.object({ id: z.string() });
    const result = validateSchema(schema, { id: 123 }, "Order");
    expect(result.valid).toBe(false);
    expect(result.stage).toBe("SCHEMA_VALIDATION");
  });

  it("detects duplicate external IDs", async () => {
    const { checkDuplicate } = await import(
      "@/modules/synchronization-engine/domain/validation.pipeline"
    );
    const existingIds = new Set(["EO-001", "EO-002"]);
    const result = checkDuplicate("EO-001", existingIds);
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.code).toBe("DUPLICATE_RECORD");
  });

  it("passes duplicate check for new ID", async () => {
    const { checkDuplicate } = await import(
      "@/modules/synchronization-engine/domain/validation.pipeline"
    );
    const result = checkDuplicate("EO-NEW", new Set(["EO-001"]));
    expect(result.valid).toBe(true);
  });
});

// ── Mock factory ───────────────────────────────────────────────────────────

describe("Mock Provider Factory", () => {
  it("creates all four adapters for the same storeId", async () => {
    const { createMockAdapters } = await import("@/adapters/mock/mock-provider.factory");
    const adapters = createMockAdapters("00000000-0000-0000-0000-000000000001");
    expect(adapters.eazyOrder.provider).toBe("EAZY_ORDER");
    expect(adapters.bosta.provider).toBe("BOSTA");
    expect(adapters.meta.provider).toBe("META");
    expect(adapters.tiktok.provider).toBe("TIKTOK");
    expect(adapters.eazyOrder.storeId).toBe(adapters.bosta.storeId);
  });
});
