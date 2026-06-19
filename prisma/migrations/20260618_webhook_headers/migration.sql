-- Add headers column to webhook_logs for debugging support
ALTER TABLE "webhook_logs"
  ADD COLUMN IF NOT EXISTS "headers" JSONB;
