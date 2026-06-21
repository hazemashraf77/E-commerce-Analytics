-- Sprint 2A — Product Catalog Foundation
-- Extends Product with cost profile, image, threshold, provider mapping.
-- Extends ProductAlias for operational (non-marketing) aliases.
-- Adds ProviderOrderItem (permanent replacement for ImportStaging ORDER_ITEM).
-- Adds AOVGroupingConfig for per-store AOV bucket configuration.

-- ── Product: cost profile + image + threshold + externalIds ────────────────
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "brand"                 TEXT,
  ADD COLUMN IF NOT EXISTS "subcategory"           TEXT,
  ADD COLUMN IF NOT EXISTS "barcode"               TEXT,
  ADD COLUMN IF NOT EXISTS "unitProductCost"       DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "packagingCost"         DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "imageUrl"              TEXT,
  ADD COLUMN IF NOT EXISTS "images"                JSONB,
  ADD COLUMN IF NOT EXISTS "minimumStockThreshold" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "maximumStockThreshold" INTEGER,
  ADD COLUMN IF NOT EXISTS "reorderPoint"          INTEGER,
  ADD COLUMN IF NOT EXISTS "reorderQuantity"       INTEGER,
  ADD COLUMN IF NOT EXISTS "estimatedShippingCost" DECIMAL(18,4),
  ADD COLUMN IF NOT EXISTS "generalExpenseRate"    DECIMAL(5,4),
  ADD COLUMN IF NOT EXISTS "externalIds"           JSONB;

-- ── ProductAlias: operational aliases (drop old unique, add new) ───────────
-- platform becomes nullable; provider + aliasType added.
ALTER TABLE "product_aliases"
  ADD COLUMN IF NOT EXISTS "provider"              TEXT,
  ADD COLUMN IF NOT EXISTS "aliasType"             TEXT NOT NULL DEFAULT 'name',
  ADD COLUMN IF NOT EXISTS "source"                TEXT,
  ADD COLUMN IF NOT EXISTS "confidenceScore"       DECIMAL(5,4),
  ADD COLUMN IF NOT EXISTS "createdAutomatically"  BOOLEAN NOT NULL DEFAULT false;

-- Drop old unique that included platform; create new on (productId, aliasName, aliasType)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_aliases_productId_aliasName_platform_key'
  ) THEN
    ALTER TABLE "product_aliases"
      DROP CONSTRAINT "product_aliases_productId_aliasName_platform_key";
  END IF;
END $$;

ALTER TABLE "product_aliases"
  ALTER COLUMN "platform" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_aliases_productId_aliasName_aliasType_key'
  ) THEN
    ALTER TABLE "product_aliases"
      ADD CONSTRAINT "product_aliases_productId_aliasName_aliasType_key"
      UNIQUE ("productId", "aliasName", "aliasType");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "product_aliases_provider_idx"  ON "product_aliases" ("provider");
CREATE INDEX IF NOT EXISTS "product_aliases_aliasName_idx" ON "product_aliases" ("aliasName");

-- ── ProviderOrderItem (new) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "provider_order_items" (
  "id"                UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"           UUID         NOT NULL,
  "provider"          TEXT         NOT NULL,
  "providerOrderId"   TEXT         NOT NULL,
  "orderId"           UUID,
  "itemIndex"         INTEGER      NOT NULL,
  "providerProductId" TEXT,
  "sku"               TEXT,
  "productName"       TEXT,
  "quantity"          DECIMAL(18,4) NOT NULL,
  "unitPrice"         DECIMAL(18,4) NOT NULL,
  "discount"          DECIMAL(18,4) NOT NULL DEFAULT 0,
  "productId"         UUID,
  "status"            TEXT         NOT NULL DEFAULT 'UNMAPPED',
  "matchedBy"         TEXT,
  "confidenceScore"   DECIMAL(5,4),
  "rawPayload"        JSONB        NOT NULL,
  "mappedAt"          TIMESTAMPTZ,
  "importedAt"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "provider_order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "provider_order_items_provider_orderId_index_key"
    UNIQUE ("provider", "providerOrderId", "itemIndex"),
  CONSTRAINT "provider_order_items_storeId_fkey"
    FOREIGN KEY ("storeId")  REFERENCES "stores"   ("id") ON DELETE CASCADE,
  CONSTRAINT "provider_order_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL,
  CONSTRAINT "provider_order_items_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "provider_order_items_storeId_status_idx"
  ON "provider_order_items" ("storeId", "status");
CREATE INDEX IF NOT EXISTS "provider_order_items_sku_idx"
  ON "provider_order_items" ("sku");
CREATE INDEX IF NOT EXISTS "provider_order_items_providerProductId_idx"
  ON "provider_order_items" ("providerProductId");
CREATE INDEX IF NOT EXISTS "provider_order_items_productId_idx"
  ON "provider_order_items" ("productId");
CREATE INDEX IF NOT EXISTS "provider_order_items_providerOrderId_idx"
  ON "provider_order_items" ("providerOrderId");
CREATE INDEX IF NOT EXISTS "provider_order_items_orderId_idx"
  ON "provider_order_items" ("orderId");
CREATE INDEX IF NOT EXISTS "provider_order_items_matchedBy_idx"
  ON "provider_order_items" ("matchedBy");

-- ── AOVGroupingConfig (new) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "aov_grouping_config" (
  "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"          UUID         NOT NULL,
  "bucketStrategy"   TEXT         NOT NULL DEFAULT 'AUTO',
  "upliftPercentage" DECIMAL(5,4) NOT NULL DEFAULT 0.25,
  "customBuckets"    JSONB,
  "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "aov_grouping_config_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "aov_grouping_config_storeId_key" UNIQUE ("storeId"),
  CONSTRAINT "aov_grouping_config_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE
);

-- ── InventoryState (new) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "inventory_state" (
  "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
  "productId"          UUID          NOT NULL,
  "physicalQuantity"   DECIMAL(18,4) NOT NULL DEFAULT 0,
  "reservedQuantity"   DECIMAL(18,4) NOT NULL DEFAULT 0,
  "incomingQuantity"   DECIMAL(18,4) NOT NULL DEFAULT 0,
  "damagedQuantity"    DECIMAL(18,4) NOT NULL DEFAULT 0,
  "returnedQuantity"   DECIMAL(18,4) NOT NULL DEFAULT 0,
  "availableQuantity"  DECIMAL(18,4) NOT NULL DEFAULT 0,
  "updatedAt"          TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "inventory_state_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_state_productId_key" UNIQUE ("productId"),
  CONSTRAINT "inventory_state_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE
);

-- ── KpiDefinition (new) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "kpi_definitions" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "key"          TEXT        NOT NULL,
  "name"         TEXT        NOT NULL,
  "category"     TEXT        NOT NULL,
  "description"  TEXT,
  "formula"      TEXT        NOT NULL,
  "dependencies" JSONB,
  "version"      INTEGER     NOT NULL DEFAULT 1,
  "isActive"     BOOLEAN     NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "kpi_definitions_key_key" UNIQUE ("key")
);

CREATE INDEX IF NOT EXISTS "kpi_definitions_category_idx"
  ON "kpi_definitions" ("category");
CREATE INDEX IF NOT EXISTS "kpi_definitions_isActive_idx"
  ON "kpi_definitions" ("isActive");