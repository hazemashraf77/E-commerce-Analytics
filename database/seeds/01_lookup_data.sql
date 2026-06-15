-- =====================================================================
-- Seed: 01_lookup_data.sql
-- Purpose: Seed static lookup data per 025_DATABASE_MIGRATIONS.md
--   (Seed Data includes: Status Tables, Lookup Tables,
--    Configuration Defaults, Permission Definitions, Language Definitions)
-- "Business transactional data is never seeded." (025)
-- Repository references: 004, 025, 032, 011
-- =====================================================================

-- Marketing Sources — mirrors 004: Entity 011 supported values
INSERT INTO "marketing_sources" ("id","name","platform","status","createdAt","updatedAt") VALUES
  (gen_random_uuid(), 'Meta',     'META',    'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'TikTok',   'TIKTOK',  'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Direct',   'DIRECT',  'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Organic',  'ORGANIC', 'ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Referral', 'REFERRAL','ACTIVE', NOW(), NOW()),
  (gen_random_uuid(), 'Unknown',  'UNKNOWN', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("platform","name") DO NOTHING;
