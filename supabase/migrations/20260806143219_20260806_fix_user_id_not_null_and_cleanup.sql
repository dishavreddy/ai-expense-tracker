-- ============================================================
-- Fix: make profile & app_settings user_id NOT NULL with default
-- Clean up orphan rows from the singleton era (user_id IS NULL)
-- ============================================================

-- Remove orphan rows that have no owner (leftover from pre-auth singleton schema)
DELETE FROM profile WHERE user_id IS NULL;
DELETE FROM app_settings WHERE user_id IS NULL;

-- Set default to auth.uid() so inserts from authenticated clients auto-populate
ALTER TABLE profile ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE app_settings ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE app_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE app_settings ALTER COLUMN user_id SET NOT NULL;
