-- Phase 1: task backlog + daily auto-generation
-- Run against your Render Postgres AFTER schema.sql:
--   psql "<your-database-url>" -f migration_001_daily_generation.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS daily_hour_cap DECIMAL(4,1) DEFAULT 8.0;

ALTER TABLE day_plan_tasks
  ADD COLUMN IF NOT EXISTS planned_duration_minutes INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE;

-- Lets friends see today's list only when explicitly turned on —
-- reuses the existing (previously unused) allow_collaboration column
-- as the master switch, this adds the finer-grained one.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS share_daily_list_with_friends BOOLEAN DEFAULT FALSE;
