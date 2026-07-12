-- Clears all seeded/dummy content while keeping real accounts + friendships.
-- Run once against your Render Postgres:
--   psql "<your-database-url>" -f cleanup_dummy_data.sql

TRUNCATE TABLE
  notifications,
  messages,
  daily_evaluations,
  day_plan_tasks,
  day_plans,
  tasks,
  task_tags
RESTART IDENTITY CASCADE;

-- Deliberately NOT touching: users, friends, friend_requests
-- Your accounts and friendship with Dara stay intact.

-- Reset login counters / install-prompt state so onboarding-style
-- flows (like the install banner) behave like a clean first run again.
UPDATE users SET
  login_count = 0,
  install_prompt_dismissed = FALSE,
  install_prompt_installed = FALSE;
