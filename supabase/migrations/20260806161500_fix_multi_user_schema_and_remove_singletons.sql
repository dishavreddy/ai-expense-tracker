-- Ensure the app uses per-user rows for every tenant table and remove singleton-style constraints.
-- This migration is safe to re-run.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE expenses ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'incomes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE incomes ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'budgets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE budgets ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recurring_expenses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE recurring_expenses ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profile' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profile ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_id_check;
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_id_check;

DELETE FROM profile WHERE user_id IS NULL;
DELETE FROM app_settings WHERE user_id IS NULL;

ALTER TABLE profile ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE app_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE profile ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE app_settings ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profile_user_id_key'
  ) THEN
    ALTER TABLE profile ADD CONSTRAINT profile_user_id_key UNIQUE (user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_settings_user_id_key'
  ) THEN
    ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profile_user ON profile (user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON app_settings (user_id);
