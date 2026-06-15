-- =====================================================================
-- Migration: 00000000000000_init
-- Purpose (025_DATABASE_MIGRATIONS.md — Migration Documentation):
--   Initialize the migration system with an empty, deterministic
--   baseline, per Sprint 0 approval (adjustment 1).
-- Business Reason:
--   Establishes version-controlled schema evolution before any business
--   table exists. The Canonical Data Model schema arrives in the
--   Database sprint (004, 006).
-- Related Repository Documents: 025, 048, 006, 004.
-- Dependencies: none (baseline).
-- Rollback Strategy: baseline is empty; nothing to roll back.
-- Author: Sprint 0 Bootstrap.
-- =====================================================================

SELECT 1;
