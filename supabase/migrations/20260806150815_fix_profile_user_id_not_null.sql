-- Make profile.user_id NOT NULL to match other tables and enforce isolation
ALTER TABLE profile ALTER COLUMN user_id SET NOT NULL;
