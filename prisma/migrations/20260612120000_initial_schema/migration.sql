-- =====================================================================
-- Migration: 20260612120000_initial_schema
-- Purpose:   Create complete Canonical Data Model schema.
-- Business Reason:
--   Implements all 25 Canonical Entities from 004_CANONICAL_DATA_MODEL.md
--   plus system/audit tables, establishing the permanent business memory
--   of the platform (006_DATABASE_SPECIFICATION.md Philosophy).
-- Repository Documents: 004, 005, 006, 025, 002, 003
-- Dependencies:         00000000000000_init (baseline)
-- Rollback Strategy:    DROP all tables in reverse dependency order.
--   Caution: do NOT roll back once business data exists. Hard delete
--   is prohibited for Orders, Inventory, Finance, Audit (006).
-- Author: Sprint 1 — Database Foundation
-- =====================================================================

-- ── ENUMS ─────────────────────────────────────────────────────────────
-- Source: 004_CANONICAL_DATA_MODEL.md (all status/type models)

CREATE TYPE "OrderStatus" AS ENUM (
  'DRAFT','PENDING','CONFIRMED','PROCESSING','READY_TO_SHIP',
  'SHIPPED','DELIVERED','CANCELLED','CLOSED'
);

CREATE TYPE "ShipmentStatus" AS ENUM (
  'CREATED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED',
  'DELIVERY_FAILED','RETURNED','EXPECTED_RETURN','CANCELLED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING','PAID','PARTIALLY_PAID','REFUNDED','FAILED','UNKNOWN'
);

CREATE TYPE "InventoryMovementType" AS ENUM (
  'PURCHASE','SALE','PHYSICAL_RETURN','EXCHANGE',
  'MANUAL_ADJUSTMENT','INVENTORY_CORRECTION','OPENING_BALANCE'
);

CREATE TYPE "FinancialEventType" AS ENUM (
  'REVENUE','COGS','SHIPPING_EXPENSE','MARKETING_EXPENSE',
  'FIXED_EXPENSE','VARIABLE_EXPENSE','REFUND','COMPENSATION',
  'MANUAL_ADJUSTMENT','SETTLEMENT','CASH_IN','CASH_OUT'
);

CREATE TYPE "CashFlowDirection" AS ENUM ('CASH_IN','CASH_OUT');

CREATE TYPE "MarketingPlatform" AS ENUM (
  'META','TIKTOK','DIRECT','ORGANIC','REFERRAL','UNKNOWN'
);

CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE','INACTIVE','ARCHIVED');

CREATE TYPE "RecognitionStatus" AS ENUM ('RECOGNIZED','PENDING','REVERSED');

CREATE TYPE "SettlementStatus" AS ENUM ('EXPECTED','RECEIVED','RECONCILED','DISPUTED');

CREATE TYPE "AiRecommendationCategory" AS ENUM (
  'REVENUE','PROFIT','INVENTORY','MARKETING','OPERATIONS','CASH_FLOW','RISK'
);

CREATE TYPE "SyncJobStatus" AS ENUM (
  'PENDING','RUNNING','COMPLETED','FAILED','CANCELLED'
);

CREATE TYPE "AuditAction" AS ENUM (
  'CREATE','UPDATE','DELETE','SOFT_DELETE','RESTORE',
  'IMPORT','EXPORT','LOGIN','LOGOUT','CONFIG_CHANGE'
);

-- ── CORE ──────────────────────────────────────────────────────────────

CREATE TABLE "stores" (
  "id"        UUID          NOT NULL DEFAULT gen_random_uuid(),
  "name"      TEXT          NOT NULL,
  "code"      TEXT          NOT NULL,
  "currency"  VARCHAR(3)    NOT NULL,
  "timeZone"  TEXT          NOT NULL,
  "status"    "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ   NOT NULL,
  CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");

CREATE TABLE "users" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "supabaseId"  TEXT        NOT NULL,
  "email"       TEXT        NOT NULL,
  "fullName"    TEXT        NOT NULL,
  "role"        TEXT        NOT NULL,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "settings" (
  "id"        UUID        NOT NULL DEFAULT gen_random_uuid(),
  "storeId"   UUID        NOT NULL,
  "key"       TEXT        NOT NULL,
  "value"     TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE UNIQUE INDEX "settings_storeId_key_key" ON "settings"("storeId","key");
CREATE INDEX "settings_storeId_idx" ON "settings"("storeId");

-- ── PRODUCTS ──────────────────────────────────────────────────────────

CREATE TABLE "products" (
  "id"                  UUID           NOT NULL DEFAULT gen_random_uuid(),
  "storeId"             UUID           NOT NULL,
  "sku"                 TEXT           NOT NULL,
  "name"                TEXT           NOT NULL,
  "category"            TEXT,
  "status"              "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "defaultSellingPrice" DECIMAL(18,4)  NOT NULL,
  "isDeleted"           BOOLEAN        NOT NULL DEFAULT FALSE,
  "deletedAt"           TIMESTAMPTZ,
  "deletedBy"           UUID,
  "createdAt"           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ    NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE UNIQUE INDEX "products_storeId_sku_key" ON "products"("storeId","sku");
CREATE INDEX "products_storeId_idx" ON "products"("storeId");
CREATE INDEX "products_status_idx" ON "products"("status");

CREATE TABLE "product_aliases" (
  "id"        UUID                NOT NULL DEFAULT gen_random_uuid(),
  "productId" UUID                NOT NULL,
  "aliasName" TEXT                NOT NULL,
  "platform"  "MarketingPlatform" NOT NULL,
  "status"    "EntityStatus"      NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ         NOT NULL,
  CONSTRAINT "product_aliases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_aliases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id")
);
CREATE UNIQUE INDEX "product_aliases_productId_aliasName_platform_key"
  ON "product_aliases"("productId","aliasName","platform");
CREATE INDEX "product_aliases_productId_idx" ON "product_aliases"("productId");
CREATE INDEX "product_aliases_platform_idx" ON "product_aliases"("platform");

-- ── ORDERS ────────────────────────────────────────────────────────────

CREATE TABLE "orders" (
  "id"                  UUID               NOT NULL DEFAULT gen_random_uuid(),
  "storeId"             UUID               NOT NULL,
  "provider"            TEXT               NOT NULL,
  "providerOrderId"     TEXT               NOT NULL,
  "orderDate"           TIMESTAMPTZ        NOT NULL,
  "customerShippingFee" DECIMAL(18,4)      NOT NULL,
  "paymentMethod"       TEXT               NOT NULL,
  "paymentStatus"       "PaymentStatus"    NOT NULL DEFAULT 'PENDING',
  "orderStatus"         "OrderStatus"      NOT NULL DEFAULT 'PENDING',
  "shipmentStatus"      "ShipmentStatus",
  "marketingSource"     "MarketingPlatform",
  "campaignId"          UUID,
  "importedAt"          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "syncedAt"            TIMESTAMPTZ,
  "createdAt"           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ        NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "orders_storeId_fkey"   FOREIGN KEY ("storeId")   REFERENCES "stores"("id"),
  CONSTRAINT "orders_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id")
);
CREATE UNIQUE INDEX "orders_storeId_provider_providerOrderId_key"
  ON "orders"("storeId","provider","providerOrderId");
CREATE INDEX "orders_storeId_idx"       ON "orders"("storeId");
CREATE INDEX "orders_orderDate_idx"     ON "orders"("orderDate");
CREATE INDEX "orders_orderStatus_idx"   ON "orders"("orderStatus");
CREATE INDEX "orders_shipmentStatus_idx" ON "orders"("shipmentStatus");
CREATE INDEX "orders_campaignId_idx"    ON "orders"("campaignId");

CREATE TABLE "order_items" (
  "id"                 UUID         NOT NULL DEFAULT gen_random_uuid(),
  "orderId"            UUID         NOT NULL,
  "productId"          UUID         NOT NULL,
  "quantity"           DECIMAL(18,4) NOT NULL,
  "unitPrice"          DECIMAL(18,4) NOT NULL,
  "discount"           DECIMAL(18,4) NOT NULL DEFAULT 0,
  "allocatedRevenue"   DECIMAL(18,4),
  "fifoCost"           DECIMAL(18,4),
  "profitContribution" DECIMAL(18,4),
  "createdAt"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "order_items_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "order_items_orderId_fkey"   FOREIGN KEY ("orderId")   REFERENCES "orders"("id"),
  CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id")
);
CREATE INDEX "order_items_orderId_idx"   ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- ── SHIPPING ──────────────────────────────────────────────────────────

CREATE TABLE "settlements" (
  "id"                   UUID               NOT NULL DEFAULT gen_random_uuid(),
  "providerSettlementId" TEXT               NOT NULL,
  "settlementDate"       TIMESTAMPTZ        NOT NULL,
  "expectedAmount"       DECIMAL(18,4)      NOT NULL,
  "actualAmount"         DECIMAL(18,4)      NOT NULL,
  "shippingCharges"      DECIMAL(18,4)      NOT NULL DEFAULT 0,
  "returnCharges"        DECIMAL(18,4)      NOT NULL DEFAULT 0,
  "exchangeCharges"      DECIMAL(18,4)      NOT NULL DEFAULT 0,
  "additionalCharges"    DECIMAL(18,4)      NOT NULL DEFAULT 0,
  "netTransfer"          DECIMAL(18,4)      NOT NULL,
  "status"               "SettlementStatus" NOT NULL DEFAULT 'EXPECTED',
  "importedAt"           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "createdAt"            TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ        NOT NULL,
  CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "settlements_providerSettlementId_key" ON "settlements"("providerSettlementId");
CREATE INDEX "settlements_settlementDate_idx" ON "settlements"("settlementDate");
CREATE INDEX "settlements_status_idx"         ON "settlements"("status");

CREATE TABLE "shipments" (
  "id"                 UUID             NOT NULL DEFAULT gen_random_uuid(),
  "orderId"            UUID             NOT NULL,
  "providerShipmentId" TEXT             NOT NULL,
  "shipmentStatus"     "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
  "shippingZone"       TEXT,
  "deliveryDate"       TIMESTAMPTZ,
  "returnDate"         TIMESTAMPTZ,
  "actualShippingCost" DECIMAL(18,4)    NOT NULL,
  "codAmount"          DECIMAL(18,4)    NOT NULL DEFAULT 0,
  "settlementId"       UUID,
  "importedAt"         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "syncedAt"           TIMESTAMPTZ,
  "createdAt"          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ      NOT NULL,
  CONSTRAINT "shipments_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id"),
  CONSTRAINT "shipments_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id")
);
CREATE UNIQUE INDEX "shipments_orderId_key"            ON "shipments"("orderId");
CREATE UNIQUE INDEX "shipments_providerShipmentId_key" ON "shipments"("providerShipmentId");
CREATE INDEX "shipments_shipmentStatus_idx" ON "shipments"("shipmentStatus");
CREATE INDEX "shipments_deliveryDate_idx"   ON "shipments"("deliveryDate");
CREATE INDEX "shipments_settlementId_idx"   ON "shipments"("settlementId");

-- ── INVENTORY ─────────────────────────────────────────────────────────

CREATE TABLE "inventory_layers" (
  "id"                UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"           UUID         NOT NULL,
  "productId"         UUID         NOT NULL,
  "purchaseDate"      TIMESTAMPTZ  NOT NULL,
  "purchaseQuantity"  DECIMAL(18,4) NOT NULL,
  "remainingQuantity" DECIMAL(18,4) NOT NULL,
  "unitCost"          DECIMAL(18,4) NOT NULL,
  "supplier"          TEXT,
  "purchaseReference" TEXT,
  "isDeleted"         BOOLEAN      NOT NULL DEFAULT FALSE,
  "deletedAt"         TIMESTAMPTZ,
  "deletedBy"         UUID,
  "createdAt"         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "inventory_layers_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "inventory_layers_storeId_fkey"   FOREIGN KEY ("storeId")   REFERENCES "stores"("id"),
  CONSTRAINT "inventory_layers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id")
);
CREATE INDEX "inventory_layers_storeId_idx"    ON "inventory_layers"("storeId");
CREATE INDEX "inventory_layers_productId_idx"  ON "inventory_layers"("productId");
CREATE INDEX "inventory_layers_purchaseDate_idx" ON "inventory_layers"("purchaseDate");

CREATE TABLE "inventory_movements" (
  "id"             UUID                    NOT NULL DEFAULT gen_random_uuid(),
  "productId"      UUID                    NOT NULL,
  "layerId"        UUID,
  "movementType"   "InventoryMovementType" NOT NULL,
  "quantity"       DECIMAL(18,4)           NOT NULL,
  "unitCost"       DECIMAL(18,4)           NOT NULL,
  "orderItemId"    UUID,
  "relatedOrderId" UUID,
  "occurredAt"     TIMESTAMPTZ             NOT NULL,
  "createdAt"      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  CONSTRAINT "inventory_movements_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "inventory_movements_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "products"("id"),
  CONSTRAINT "inventory_movements_layerId_fkey"    FOREIGN KEY ("layerId")    REFERENCES "inventory_layers"("id"),
  CONSTRAINT "inventory_movements_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id")
);
CREATE INDEX "inventory_movements_productId_idx"    ON "inventory_movements"("productId");
CREATE INDEX "inventory_movements_movementType_idx" ON "inventory_movements"("movementType");
CREATE INDEX "inventory_movements_occurredAt_idx"   ON "inventory_movements"("occurredAt");

-- ── FINANCE ───────────────────────────────────────────────────────────

CREATE TABLE "financial_adjustments" (
  "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
  "orderId"        UUID,
  "adjustmentType" TEXT         NOT NULL,
  "amount"         DECIMAL(18,4) NOT NULL,
  "reason"         TEXT         NOT NULL,
  "notes"          TEXT,
  "attachmentUrl"  TEXT,
  "createdBy"      UUID         NOT NULL,
  "occurredAt"     TIMESTAMPTZ  NOT NULL,
  "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "financial_adjustments_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "financial_adjustments_orderId_fkey"    FOREIGN KEY ("orderId")    REFERENCES "orders"("id"),
  CONSTRAINT "financial_adjustments_createdBy_fkey"  FOREIGN KEY ("createdBy") REFERENCES "users"("id")
);
CREATE INDEX "financial_adjustments_orderId_idx"    ON "financial_adjustments"("orderId");
CREATE INDEX "financial_adjustments_occurredAt_idx" ON "financial_adjustments"("occurredAt");
CREATE INDEX "financial_adjustments_createdBy_idx"  ON "financial_adjustments"("createdBy");

CREATE TABLE "revenue_events" (
  "id"                UUID                NOT NULL DEFAULT gen_random_uuid(),
  "orderId"           UUID                NOT NULL,
  "revenueAmount"     DECIMAL(18,4)       NOT NULL,
  "revenueDate"       TIMESTAMPTZ         NOT NULL,
  "recognitionStatus" "RecognitionStatus" NOT NULL DEFAULT 'RECOGNIZED',
  "createdAt"         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  CONSTRAINT "revenue_events_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "revenue_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id")
);
CREATE INDEX "revenue_events_orderId_idx"     ON "revenue_events"("orderId");
CREATE INDEX "revenue_events_revenueDate_idx" ON "revenue_events"("revenueDate");

CREATE TABLE "cost_events" (
  "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
  "orderId"         UUID         NOT NULL,
  "fifoCost"        DECIMAL(18,4) NOT NULL,
  "recognitionDate" TIMESTAMPTZ  NOT NULL,
  "createdAt"       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "cost_events_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "cost_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id")
);
CREATE INDEX "cost_events_orderId_idx"         ON "cost_events"("orderId");
CREATE INDEX "cost_events_recognitionDate_idx" ON "cost_events"("recognitionDate");

CREATE TABLE "profit_events" (
  "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
  "orderId"         UUID         NOT NULL,
  "grossProfit"     DECIMAL(18,4) NOT NULL,
  "netProfit"       DECIMAL(18,4) NOT NULL,
  "profitMargin"    DECIMAL(18,4) NOT NULL,
  "recognitionDate" TIMESTAMPTZ  NOT NULL,
  "createdAt"       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "profit_events_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "profit_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id")
);
CREATE INDEX "profit_events_orderId_idx"         ON "profit_events"("orderId");
CREATE INDEX "profit_events_recognitionDate_idx" ON "profit_events"("recognitionDate");

CREATE TABLE "cash_flow_events" (
  "id"        UUID                 NOT NULL DEFAULT gen_random_uuid(),
  "type"      "FinancialEventType" NOT NULL,
  "amount"    DECIMAL(18,4)        NOT NULL,
  "direction" "CashFlowDirection"  NOT NULL,
  "reference" TEXT,
  "orderId"   UUID,
  "eventDate" TIMESTAMPTZ          NOT NULL,
  "createdAt" TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  CONSTRAINT "cash_flow_events_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "cash_flow_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id")
);
CREATE INDEX "cash_flow_events_eventDate_idx" ON "cash_flow_events"("eventDate");
CREATE INDEX "cash_flow_events_direction_idx" ON "cash_flow_events"("direction");
CREATE INDEX "cash_flow_events_type_idx"      ON "cash_flow_events"("type");

CREATE TABLE "fixed_expenses" (
  "id"        UUID           NOT NULL DEFAULT gen_random_uuid(),
  "storeId"   UUID           NOT NULL,
  "name"      TEXT           NOT NULL,
  "amount"    DECIMAL(18,4)  NOT NULL,
  "period"    TEXT           NOT NULL,
  "category"  TEXT,
  "status"    "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted" BOOLEAN        NOT NULL DEFAULT FALSE,
  "deletedAt" TIMESTAMPTZ,
  "deletedBy" UUID,
  "createdAt" TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ    NOT NULL,
  CONSTRAINT "fixed_expenses_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "fixed_expenses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE INDEX "fixed_expenses_storeId_idx" ON "fixed_expenses"("storeId");
CREATE INDEX "fixed_expenses_period_idx"  ON "fixed_expenses"("period");

CREATE TABLE "variable_expenses" (
  "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"     UUID         NOT NULL,
  "name"        TEXT         NOT NULL,
  "amount"      DECIMAL(18,4) NOT NULL,
  "expenseDate" TIMESTAMPTZ  NOT NULL,
  "category"    TEXT,
  "orderId"     UUID,
  "isDeleted"   BOOLEAN      NOT NULL DEFAULT FALSE,
  "deletedAt"   TIMESTAMPTZ,
  "deletedBy"   UUID,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "variable_expenses_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "variable_expenses_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE INDEX "variable_expenses_storeId_idx"     ON "variable_expenses"("storeId");
CREATE INDEX "variable_expenses_expenseDate_idx" ON "variable_expenses"("expenseDate");

-- ── MARKETING ─────────────────────────────────────────────────────────

CREATE TABLE "marketing_sources" (
  "id"        UUID                NOT NULL DEFAULT gen_random_uuid(),
  "name"      TEXT                NOT NULL,
  "platform"  "MarketingPlatform" NOT NULL,
  "status"    "EntityStatus"      NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ         NOT NULL,
  CONSTRAINT "marketing_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "marketing_sources_platform_name_key" ON "marketing_sources"("platform","name");

CREATE TABLE "campaigns" (
  "id"                 UUID                NOT NULL DEFAULT gen_random_uuid(),
  "storeId"            UUID                NOT NULL,
  "platform"           "MarketingPlatform" NOT NULL,
  "platformCampaignId" TEXT                NOT NULL,
  "name"               TEXT                NOT NULL,
  "objective"          TEXT,
  "status"             "EntityStatus"      NOT NULL DEFAULT 'ACTIVE',
  "startDate"          TIMESTAMPTZ,
  "endDate"            TIMESTAMPTZ,
  "importedAt"         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "createdAt"          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ         NOT NULL,
  CONSTRAINT "campaigns_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "campaigns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE UNIQUE INDEX "campaigns_storeId_platform_platformCampaignId_key"
  ON "campaigns"("storeId","platform","platformCampaignId");
CREATE INDEX "campaigns_storeId_idx"  ON "campaigns"("storeId");
CREATE INDEX "campaigns_platform_idx" ON "campaigns"("platform");
CREATE INDEX "campaigns_startDate_endDate_idx" ON "campaigns"("startDate","endDate");

CREATE TABLE "marketing_spends" (
  "id"         UUID                NOT NULL DEFAULT gen_random_uuid(),
  "storeId"    UUID                NOT NULL,
  "platform"   "MarketingPlatform" NOT NULL,
  "campaignId" UUID,
  "spendDate"  TIMESTAMPTZ         NOT NULL,
  "amount"     DECIMAL(18,4)       NOT NULL,
  "currency"   VARCHAR(3)          NOT NULL,
  "importedAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "createdAt"  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ         NOT NULL,
  CONSTRAINT "marketing_spends_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "marketing_spends_storeId_fkey"   FOREIGN KEY ("storeId")   REFERENCES "stores"("id"),
  CONSTRAINT "marketing_spends_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id")
);
CREATE UNIQUE INDEX "marketing_spends_storeId_platform_campaignId_spendDate_key"
  ON "marketing_spends"("storeId","platform","campaignId","spendDate");
CREATE INDEX "marketing_spends_storeId_idx"   ON "marketing_spends"("storeId");
CREATE INDEX "marketing_spends_spendDate_idx" ON "marketing_spends"("spendDate");
CREATE INDEX "marketing_spends_platform_idx"  ON "marketing_spends"("platform");

-- ── ANALYTICS ─────────────────────────────────────────────────────────

CREATE TABLE "daily_snapshots" (
  "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"        UUID         NOT NULL,
  "snapshotDate"   DATE         NOT NULL,
  "revenue"        DECIMAL(18,4) NOT NULL,
  "profit"         DECIMAL(18,4) NOT NULL,
  "cashPosition"   DECIMAL(18,4) NOT NULL,
  "inventoryValue" DECIMAL(18,4) NOT NULL,
  "marketingSpend" DECIMAL(18,4) NOT NULL,
  "deliveryRate"   DECIMAL(18,4) NOT NULL,
  "returnRate"     DECIMAL(18,4) NOT NULL,
  "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "daily_snapshots_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "daily_snapshots_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE UNIQUE INDEX "daily_snapshots_storeId_snapshotDate_key"
  ON "daily_snapshots"("storeId","snapshotDate");
CREATE INDEX "daily_snapshots_storeId_idx"      ON "daily_snapshots"("storeId");
CREATE INDEX "daily_snapshots_snapshotDate_idx" ON "daily_snapshots"("snapshotDate");

CREATE TABLE "forecasts" (
  "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"       UUID         NOT NULL,
  "forecastType"  TEXT         NOT NULL,
  "period"        TEXT         NOT NULL,
  "confidence"    DECIMAL(5,4) NOT NULL,
  "expectedValue" DECIMAL(18,4) NOT NULL,
  "generatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "createdAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "forecasts_storeId_idx" ON "forecasts"("storeId");
CREATE INDEX "forecasts_period_idx"  ON "forecasts"("period");

CREATE TABLE "scenario_simulations" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "storeId"      UUID        NOT NULL,
  "scenarioName" TEXT        NOT NULL,
  "inputs"       JSONB       NOT NULL,
  "results"      JSONB       NOT NULL,
  "createdBy"    UUID        NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "scenario_simulations_pkey"        PRIMARY KEY ("id"),
  CONSTRAINT "scenario_simulations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id")
);
CREATE INDEX "scenario_simulations_storeId_idx"   ON "scenario_simulations"("storeId");
CREATE INDEX "scenario_simulations_createdBy_idx" ON "scenario_simulations"("createdBy");

-- ── AI ────────────────────────────────────────────────────────────────

CREATE TABLE "ai_recommendations" (
  "id"               UUID                      NOT NULL DEFAULT gen_random_uuid(),
  "storeId"          UUID                      NOT NULL,
  "priority"         INTEGER                   NOT NULL,
  "category"         "AiRecommendationCategory" NOT NULL,
  "confidence"       DECIMAL(5,4)              NOT NULL,
  "supportingKpis"   JSONB                     NOT NULL,
  "expectedImpact"   TEXT                      NOT NULL,
  "recommendedAction" TEXT                     NOT NULL,
  "generatedAt"      TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  "createdAt"        TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ai_recommendations_storeId_idx"     ON "ai_recommendations"("storeId");
CREATE INDEX "ai_recommendations_generatedAt_idx" ON "ai_recommendations"("generatedAt");
CREATE INDEX "ai_recommendations_category_idx"    ON "ai_recommendations"("category");

-- ── AUDIT ─────────────────────────────────────────────────────────────

CREATE TABLE "audit_records" (
  "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
  "entityType"    TEXT          NOT NULL,
  "entityId"      TEXT          NOT NULL,
  "userId"        UUID,
  "action"        "AuditAction" NOT NULL,
  "previousValue" JSONB,
  "newValue"      JSONB,
  "ipAddress"     TEXT,
  "userAgent"     TEXT,
  "occurredAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "audit_records_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "audit_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id")
);
CREATE INDEX "audit_records_entityType_entityId_idx" ON "audit_records"("entityType","entityId");
CREATE INDEX "audit_records_userId_idx"     ON "audit_records"("userId");
CREATE INDEX "audit_records_occurredAt_idx" ON "audit_records"("occurredAt");

-- ── SYSTEM ────────────────────────────────────────────────────────────

CREATE TABLE "sync_jobs" (
  "id"             UUID            NOT NULL DEFAULT gen_random_uuid(),
  "storeId"        UUID            NOT NULL,
  "provider"       TEXT            NOT NULL,
  "status"         "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
  "startedAt"      TIMESTAMPTZ,
  "completedAt"    TIMESTAMPTZ,
  "recordsFound"   INTEGER         NOT NULL DEFAULT 0,
  "recordsSynced"  INTEGER         NOT NULL DEFAULT 0,
  "recordsFailed"  INTEGER         NOT NULL DEFAULT 0,
  "errorMessage"   TEXT,
  "createdAt"      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ     NOT NULL,
  CONSTRAINT "sync_jobs_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "sync_jobs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id")
);
CREATE INDEX "sync_jobs_storeId_idx"  ON "sync_jobs"("storeId");
CREATE INDEX "sync_jobs_provider_idx" ON "sync_jobs"("provider");
CREATE INDEX "sync_jobs_status_idx"   ON "sync_jobs"("status");
CREATE INDEX "sync_jobs_createdAt_idx" ON "sync_jobs"("createdAt");

CREATE TABLE "import_staging" (
  "id"               UUID            NOT NULL DEFAULT gen_random_uuid(),
  "provider"         TEXT            NOT NULL,
  "entityType"       TEXT            NOT NULL,
  "externalId"       TEXT            NOT NULL,
  "rawPayload"       JSONB           NOT NULL,
  "validationErrors" JSONB,
  "status"           "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
  "retryCount"       INTEGER         NOT NULL DEFAULT 0,
  "processedAt"      TIMESTAMPTZ,
  "importedAt"       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  CONSTRAINT "import_staging_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "import_staging_provider_entityType_idx" ON "import_staging"("provider","entityType");
CREATE INDEX "import_staging_externalId_idx" ON "import_staging"("externalId");
CREATE INDEX "import_staging_status_idx"     ON "import_staging"("status");
