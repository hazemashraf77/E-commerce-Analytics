/**
 * tests/bootstrap/health.test.ts
 *
 * Sprint 0 bootstrap integrity tests (048_PROJECT_BOOTSTRAP.md — Initial Tests).
 * Verifies: compilation artifacts, utility contracts, RBAC scaffold,
 * env schema, error utilities, validation helpers.
 * No business logic, no formulas, no KPIs (CP-002, CP-003, CP-004).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Utilities ────────────────────────────────────────────────────────────────

describe("utils/date", () => {
  it("formatIsoDate produces YYYY-MM-DD", async () => {
    const { formatIsoDate } = await import("@/utils/date");
    expect(formatIsoDate(new Date("2024-01-15T00:00:00.000Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("parseIsoDate rejects invalid strings", async () => {
    const { parseIsoDate } = await import("@/utils/date");
    expect(() => parseIsoDate("not-a-date")).toThrow();
  });
});

describe("utils/currency", () => {
  it("formats a valid amount with explicit currency", async () => {
    const { formatCurrency } = await import("@/utils/currency");
    const result = formatCurrency(1000, "EGP", "en");
    expect(result).toContain("1,000");
  });

  it("throws on non-finite amount", async () => {
    const { formatCurrency } = await import("@/utils/currency");
    expect(() => formatCurrency(NaN, "EGP")).toThrow();
  });

  it("throws when currency code is missing", async () => {
    const { formatCurrency } = await import("@/utils/currency");
    expect(() => formatCurrency(100, "")).toThrow();
  });
});

describe("utils/number", () => {
  it("formatPercent renders ratio as percentage string", async () => {
    const { formatPercent } = await import("@/utils/number");
    const result = formatPercent(0.856, "en");
    expect(result).toContain("85.6");
  });

  it("throws on non-finite input", async () => {
    const { formatNumber } = await import("@/utils/number");
    expect(() => formatNumber(Infinity)).toThrow();
  });
});

describe("utils/errors", () => {
  it("AppError carries code and severity", async () => {
    const { AppError, isAppError } = await import("@/utils/errors");
    const err = new AppError({ code: "TEST_001", message: "test", severity: "HIGH" });
    expect(err.code).toBe("TEST_001");
    expect(err.severity).toBe("HIGH");
    expect(isAppError(err)).toBe(true);
  });

  it("toError wraps string into Error", async () => {
    const { toError } = await import("@/utils/errors");
    expect(toError("something went wrong")).toBeInstanceOf(Error);
  });
});

describe("utils/validation", () => {
  it("parseOrThrow returns valid data", async () => {
    const { parseOrThrow } = await import("@/utils/validation");
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });
    expect(parseOrThrow(schema, { name: "test" }, "test")).toEqual({ name: "test" });
  });

  it("parseOrThrow throws AppError on invalid input", async () => {
    const { parseOrThrow } = await import("@/utils/validation");
    const { z } = await import("zod");
    const { isAppError } = await import("@/utils/errors");
    const schema = z.object({ age: z.number() });
    expect(() => parseOrThrow(schema, { age: "not-a-number" }, "test")).toSatisfy(
      (fn: () => void) => {
        try {
          fn();
        } catch (e) {
          return isAppError(e);
        }
        return false;
      },
    );
  });
});

// ── RBAC scaffold ────────────────────────────────────────────────────────────

describe("lib/auth/rbac", () => {
  it("ROLES contains the six documented roles from 032_PERMISSION_MATRIX.md", async () => {
    const { ROLES } = await import("@/lib/auth/rbac");
    expect(ROLES).toContain("ADMINISTRATOR");
    expect(ROLES).toContain("MANAGER");
    expect(ROLES).toContain("FINANCE");
    expect(ROLES).toContain("INVENTORY");
    expect(ROLES).toContain("MARKETING");
    expect(ROLES).toContain("READ_ONLY");
    expect(ROLES).toHaveLength(6);
  });

  it("ADMINISTRATOR has authority over MANAGER", async () => {
    const { hasRoleAtLeast } = await import("@/lib/auth/rbac");
    expect(hasRoleAtLeast("ADMINISTRATOR", "MANAGER")).toBe(true);
  });

  it("READ_ONLY does not satisfy MANAGER requirement", async () => {
    const { hasRoleAtLeast } = await import("@/lib/auth/rbac");
    expect(hasRoleAtLeast("READ_ONLY", "MANAGER")).toBe(false);
  });

  it("isRole rejects unknown string", async () => {
    const { isRole } = await import("@/lib/auth/rbac");
    expect(isRole("SUPERUSER")).toBe(false);
  });
});

// ── i18n routing ─────────────────────────────────────────────────────────────

describe("config/i18n/routing", () => {
  it("supports en and ar locales", async () => {
    const { routing } = await import("@/config/i18n/routing");
    expect(routing.locales).toContain("en");
    expect(routing.locales).toContain("ar");
  });

  it("Arabic is RTL, English is LTR", async () => {
    const { directionFor } = await import("@/config/i18n/routing");
    expect(directionFor("ar")).toBe("rtl");
    expect(directionFor("en")).toBe("ltr");
  });
});

// ── Environment schema ────────────────────────────────────────────────────────

describe("lib/env (schema validation)", () => {
  beforeEach(async () => {
    const { __resetEnvCacheForTests } = await import("@/lib/env");
    __resetEnvCacheForTests();
  });

  it("getServerEnv throws when required variables are absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const { getServerEnv } = await import("@/lib/env");
    expect(() => getServerEnv()).toThrow(/Invalid server environment configuration/);
    vi.unstubAllEnvs();
  });
});

// ── Logger ───────────────────────────────────────────────────────────────────

describe("lib/logger", () => {
  it("createLogger returns an object with all documented log levels", async () => {
    const { createLogger } = await import("@/lib/logger");
    const logger = createLogger("Bootstrap");
    expect(typeof logger.trace).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.fatal).toBe("function");
  });
});
