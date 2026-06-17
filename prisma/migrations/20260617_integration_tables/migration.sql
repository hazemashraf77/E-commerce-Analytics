-- Add webhook_logs table
CREATE TABLE IF NOT EXISTS "webhook_logs" (
  "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
  "provider"     TEXT         NOT NULL,
  "eventType"    TEXT         NOT NULL,
  "externalId"   TEXT         NOT NULL,
  "payload"      JSONB        NOT NULL,
  "status"       TEXT         NOT NULL DEFAULT 'RECEIVED',
  "errorMessage" TEXT,
  "processedAt"  TIMESTAMPTZ,
  "receivedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "webhook_logs_provider_externalId_key" UNIQUE ("provider", "externalId")
);
CREATE INDEX IF NOT EXISTS "webhook_logs_provider_status_idx"  ON "webhook_logs" ("provider", "status");
CREATE INDEX IF NOT EXISTS "webhook_logs_receivedAt_idx"       ON "webhook_logs" ("receivedAt");

-- Add integration_settings table
CREATE TABLE IF NOT EXISTS "integration_settings" (
  "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"   UUID         NOT NULL,
  "provider"  TEXT         NOT NULL,
  "key"       TEXT         NOT NULL,
  "value"     TEXT         NOT NULL,
  "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "integration_settings_storeId_provider_key_key" UNIQUE ("storeId", "provider", "key"),
  CONSTRAINT "integration_settings_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "integration_settings_storeId_provider_idx" ON "integration_settings" ("storeId", "provider");

-- Add sync_state table
CREATE TABLE IF NOT EXISTS "sync_state" (
  "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
  "storeId"     UUID         NOT NULL,
  "provider"    TEXT         NOT NULL,
  "scope"       TEXT         NOT NULL,
  "lastSyncAt"  TIMESTAMPTZ,
  "lastCursor"  TEXT,
  "status"      TEXT         NOT NULL DEFAULT 'IDLE',
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "sync_state_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sync_state_storeId_provider_scope_key" UNIQUE ("storeId", "provider", "scope"),
  CONSTRAINT "sync_state_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "sync_state_storeId_provider_idx" ON "sync_state" ("storeId", "provider");
