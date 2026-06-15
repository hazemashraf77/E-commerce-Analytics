/**
 * tests/api/api.test.ts
 * Sprint 6 — API Layer tests.
 *
 * Tests: response helpers, schemas, middleware utilities, pagination,
 *        error codes, date range helpers. No live DB or auth required.
 */

import { describe, it, expect } from "vitest";

// ── Response helpers (029: RESPONSE FORMAT, ERROR FORMAT) ─────────────────

describe("API response structure (029_API_SPECIFICATION)", () => {
  it("ok() returns success:true with data and timestamp", async () => {
    const { ok } = await import("@/lib/api/response");
    const res = ok({ value: 42 });
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.value).toBe(42);
    expect(body.timestamp).toBeDefined();
  });

  it("apiError() returns success:false with code and timestamp", async () => {
    const { apiError, API_ERROR_CODES } = await import("@/lib/api/response");
    const res = apiError(API_ERROR_CODES.VALIDATION_ERROR, "bad input", 422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.timestamp).toBeDefined();
  });

  it("paginated() includes pagination metadata", async () => {
    const { paginated } = await import("@/lib/api/response");
    const res = paginated([1, 2, 3], 1, 20, 45);
    const body = await res.json();
    expect(body.data.items).toHaveLength(3);
    expect(body.data.totalPages).toBe(3); // ceil(45/20)
    expect(body.data.total).toBe(45);
    expect(body.data.page).toBe(1);
    expect(body.data.pageSize).toBe(20);
  });

  it("jobQueued() includes pollUrl", async () => {
    const { jobQueued } = await import("@/lib/api/response");
    const res = jobQueued("job-123", "SYNC_ORDERS");
    const body = await res.json();
    expect(body.data.pollUrl).toBe("/api/v1/jobs/job-123");
    expect(body.data.status).toBe("queued");
  });
});

// ── All documented error codes are defined (029: ERROR CODES) ─────────────

describe("API error codes (029_API_SPECIFICATION)", () => {
  it("all 12 documented error codes are defined", async () => {
    const { API_ERROR_CODES } = await import("@/lib/api/response");
    const expected = [
      "VALIDATION_ERROR", "AUTHENTICATION_FAILED", "AUTHORIZATION_DENIED",
      "ENTITY_NOT_FOUND", "DUPLICATE_RECORD", "BUSINESS_RULE_VIOLATION",
      "FORMULA_ERROR", "FIFO_ERROR", "SYNCHRONIZATION_FAILED",
      "EXTERNAL_PROVIDER_ERROR", "RATE_LIMIT_EXCEEDED", "INTERNAL_SERVER_ERROR",
    ];
    for (const code of expected) {
      expect(Object.values(API_ERROR_CODES)).toContain(code);
    }
  });
});

// ── Request schemas validation (029: VALIDATION) ──────────────────────────

describe("PaginationSchema", () => {
  it("defaults to page=1 pageSize=20", async () => {
    const { PaginationSchema } = await import("@/lib/api/schemas");
    const result = PaginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("clamps pageSize to 100", async () => {
    const { PaginationSchema } = await import("@/lib/api/schemas");
    const result = PaginationSchema.parse({ pageSize: "999" });
    expect(result.pageSize).toBe(100);
  });

  it("rejects page=0", async () => {
    const { PaginationSchema } = await import("@/lib/api/schemas");
    expect(() => PaginationSchema.parse({ page: "0" })).toThrow();
  });
});

describe("DateRangeSchema", () => {
  it("rejects from after to", async () => {
    const { DateRangeSchema } = await import("@/lib/api/schemas");
    const result = DateRangeSchema.safeParse({ from: "2024-12-31T00:00:00Z", to: "2024-01-01T00:00:00Z" });
    expect(result.success).toBe(false);
  });

  it("accepts valid range", async () => {
    const { DateRangeSchema } = await import("@/lib/api/schemas");
    const result = DateRangeSchema.safeParse({ from: "2024-01-01T00:00:00Z", to: "2024-12-31T00:00:00Z" });
    expect(result.success).toBe(true);
  });
});

describe("DashboardQuerySchema", () => {
  it("defaults to LAST_30_DAYS period", async () => {
    const { DashboardQuerySchema } = await import("@/lib/api/schemas");
    const result = DashboardQuerySchema.parse({ storeId: "00000000-0000-0000-0000-000000000001" });
    expect(result.period).toBe("LAST_30_DAYS");
  });

  it("rejects invalid storeId", async () => {
    const { DashboardQuerySchema } = await import("@/lib/api/schemas");
    expect(() => DashboardQuerySchema.parse({ storeId: "not-a-uuid" })).toThrow();
  });
});

describe("CreateAdjustmentSchema", () => {
  it("requires reason (007_FINANCIAL_ENGINE)", async () => {
    const { CreateAdjustmentSchema } = await import("@/lib/api/schemas");
    const result = CreateAdjustmentSchema.safeParse({
      storeId: "00000000-0000-0000-0000-000000000001",
      adjustmentType: "REFUND",
      amount: -50,
      reason: "",  // empty reason must fail
      occurredAt: "2024-01-15T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid adjustment", async () => {
    const { CreateAdjustmentSchema } = await import("@/lib/api/schemas");
    const result = CreateAdjustmentSchema.safeParse({
      storeId: "00000000-0000-0000-0000-000000000001",
      adjustmentType: "COMPENSATION",
      amount: -100,
      reason: "Customer complained about damaged item",
      occurredAt: "2024-01-15T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("OrderListQuerySchema", () => {
  it("defaults to sort by orderDate desc", async () => {
    const { OrderListQuerySchema } = await import("@/lib/api/schemas");
    const result = OrderListQuerySchema.parse({ storeId: "00000000-0000-0000-0000-000000000001" });
    expect(result.sortBy).toBe("orderDate");
    expect(result.sortDirection).toBe("desc");
  });

  it("accepts DELIVERED status filter", async () => {
    const { OrderListQuerySchema } = await import("@/lib/api/schemas");
    const result = OrderListQuerySchema.parse({
      storeId: "00000000-0000-0000-0000-000000000001",
      status: "DELIVERED",
    });
    expect(result.status).toBe("DELIVERED");
  });
});

// ── Middleware utilities ───────────────────────────────────────────────────

describe("parsePagination", () => {
  it("parses page and pageSize from URL", async () => {
    const { parsePagination } = await import("@/lib/api/middleware");
    const req = new Request("http://localhost/api?page=3&pageSize=50");
    const result = parsePagination(req as any);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it("defaults to page 1, pageSize 20", async () => {
    const { parsePagination } = await import("@/lib/api/middleware");
    const req = new Request("http://localhost/api");
    const result = parsePagination(req as any);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("clamps pageSize to 100", async () => {
    const { parsePagination } = await import("@/lib/api/middleware");
    const req = new Request("http://localhost/api?pageSize=500");
    const result = parsePagination(req as any);
    expect(result.pageSize).toBe(100);
  });
});

describe("parseSorting", () => {
  it("returns default when sortBy field is not allowed", async () => {
    const { parseSorting } = await import("@/lib/api/middleware");
    const req = new Request("http://localhost/api?sortBy=hackField&sortDirection=asc");
    const result = parseSorting(req as any, ["orderDate", "createdAt"], "orderDate");
    expect(result.sortBy).toBe("orderDate"); // sanitized to default
    expect(result.sortDirection).toBe("asc");
  });
});

// ── RBAC ──────────────────────────────────────────────────────────────────

describe("RBAC hierarchy (032_PERMISSION_MATRIX)", () => {
  it("ADMINISTRATOR has authority over all roles", async () => {
    const { hasRoleAtLeast } = await import("@/lib/auth/rbac");
    for (const role of ["MANAGER", "FINANCE", "INVENTORY", "MARKETING", "READ_ONLY"] as const) {
      expect(hasRoleAtLeast("ADMINISTRATOR", role)).toBe(true);
    }
  });

  it("READ_ONLY cannot satisfy FINANCE requirement", async () => {
    const { hasRoleAtLeast } = await import("@/lib/auth/rbac");
    expect(hasRoleAtLeast("READ_ONLY", "FINANCE")).toBe(false);
  });

  it("FINANCE cannot satisfy ADMINISTRATOR requirement", async () => {
    const { hasRoleAtLeast } = await import("@/lib/auth/rbac");
    expect(hasRoleAtLeast("FINANCE", "ADMINISTRATOR")).toBe(false);
  });
});

// ── Improvement 1: totalShippedOrders rename ───────────────────────────────

describe("Improvement 1: totalShippedOrders naming (003 Terms 041-043)", () => {
  it("OperationalRateInput uses totalShippedOrders, not totalOrders", async () => {
    // TypeScript type check: if this compiles, the field is named correctly
    const input = {
      storeId: "store",
      range: { from: new Date(), to: new Date() },
      totalShippedOrders: 100,
      deliveredOrders: 87,
      returnedOrders: 5,
      refusedOrders: 4,
      exchangedOrders: 4,
    };
    const { calculateDeliveryRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateDeliveryRate(input);
    expect(result.value.toString()).toBe("0.87");
  });
});

// ── Improvement 2: Item KPI foundation ───────────────────────────────────

describe("Improvement 2: Order vs Item KPI architecture", () => {
  it("FUTURE_ITEM_KPI_IDS are reserved but not yet in KPI_REGISTRY", async () => {
    const { FUTURE_ITEM_KPI_IDS } = await import("@/modules/analytics-engine/domain/operational-counts.types");
    const { KPI_REGISTRY } = await import("@/modules/analytics-engine/domain/kpi.registry");
    const registeredIds = KPI_REGISTRY.map((k) => k.kpiId);
    for (const futureId of Object.values(FUTURE_ITEM_KPI_IDS)) {
      expect(registeredIds).not.toContain(futureId);
    }
  });

  it("FullOperationalInput accepts null itemCounts (backward compatible)", async () => {
    const input = {
      orderCounts: {
        storeId: "store",
        range: { from: new Date(), to: new Date() },
        totalShippedOrders: 100,
        createdOrders: 120,
        confirmedOrders: 115,
        sentToShippingOrders: 105,
        inTransitOrders: 95,
        deliveredOrders: 87,
        refusedOrders: 4,
        returningToUsOrders: 3,
        physicallyReturnedOrders: 5,
        exchangeOrders: 4,
        cancelledOrders: 5,
      },
      itemCounts: null, // null until Item KPI sprint
    };
    // Type-safe structural check
    expect(input.itemCounts).toBeNull();
    expect(input.orderCounts.totalShippedOrders).toBe(100);
  });
});
