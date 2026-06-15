/**
 * API request validation schemas.
 * Repository: 029_API_SPECIFICATION.md — VALIDATION, PAGINATION, FILTERING, SORTING
 *             "Business logic is never executed before validation." (029)
 */

import { z } from "zod";

// ── Pagination (029: PAGINATION) ───────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ── Sort direction (029: SORTING) ─────────────────────────────────────────

export const SortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

// ── Date range (029: FILTERING) ───────────────────────────────────────────

export const DateRangeSchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
}).refine(
  (v) => {
    if (v.from && v.to) return new Date(v.from) <= new Date(v.to);
    return true;
  },
  { message: "from must be before or equal to to" },
);

// ── Analytics period (010: HISTORICAL ANALYSIS) ───────────────────────────

export const AnalyticsPeriodSchema = z.enum([
  "TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS",
  "THIS_MONTH", "LAST_MONTH", "THIS_QUARTER", "LAST_QUARTER",
  "THIS_YEAR", "LAST_YEAR", "CUSTOM",
]).default("LAST_30_DAYS");

// ── Store ID ───────────────────────────────────────────────────────────────

export const StoreIdSchema = z.string().uuid({ message: "storeId must be a valid UUID" });

// ── UUID param ─────────────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();

// ── Dashboard KPI query ────────────────────────────────────────────────────

export const DashboardQuerySchema = PaginationSchema.extend({
  storeId: StoreIdSchema,
  period: AnalyticsPeriodSchema,
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ── Order list query (029: FILTERING + SORTING) ───────────────────────────

export const OrderListQuerySchema = PaginationSchema.extend({
  storeId: StoreIdSchema,
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  status: z.enum([
    "DRAFT", "PENDING", "CONFIRMED", "PROCESSING", "READY_TO_SHIP",
    "SHIPPED", "DELIVERED", "CANCELLED", "CLOSED",
  ]).optional(),
  sortBy: z.enum(["orderDate", "createdAt", "orderStatus"]).default("orderDate"),
  sortDirection: SortDirectionSchema,
});

// ── Financial adjustment create ────────────────────────────────────────────

export const CreateAdjustmentSchema = z.object({
  storeId: StoreIdSchema,
  orderId: UuidSchema.optional(),
  adjustmentType: z.string().min(1),
  amount: z.number().refine((n) => Number.isFinite(n), "amount must be finite"),
  reason: z.string().min(1, "reason is required (007_FINANCIAL_ENGINE)"),
  notes: z.string().optional(),
  occurredAt: z.string().datetime({ offset: true }),
});

// ── Inventory purchase create ──────────────────────────────────────────────

export const CreatePurchaseSchema = z.object({
  storeId: StoreIdSchema,
  productId: UuidSchema,
  purchaseDate: z.string().datetime({ offset: true }),
  quantity: z.number().positive("quantity must be positive"),
  unitCost: z.number().positive("unitCost must be positive"),
  supplier: z.string().optional(),
  purchaseReference: z.string().optional(),
});

// ── Marketing period query ─────────────────────────────────────────────────

export const MarketingQuerySchema = PaginationSchema.extend({
  storeId: StoreIdSchema,
  period: AnalyticsPeriodSchema,
  platform: z.enum(["META", "TIKTOK", "ALL"]).default("ALL"),
});

// ── Settings update ───────────────────────────────────────────────────────

export const UpdateSettingSchema = z.object({
  storeId: StoreIdSchema,
  key: z.string().min(1),
  value: z.string(),
});
