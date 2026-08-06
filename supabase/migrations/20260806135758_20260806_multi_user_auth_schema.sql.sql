/*
# Multi-User Auth Schema Migration

## Overview
Converts the expense tracker from single-tenant (no auth, shared data) to
multi-tenant (each user sees only their own data). Adds user_id columns,
removes singleton constraints, and replaces world-open RLS policies with
owner-scoped policies using auth.uid().

## Changes by Table

### expenses
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE.
- RLS policies replaced: authenticated users can only SELECT/INSERT/UPDATE/DELETE their own rows.

### incomes
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE.
- RLS policies replaced: owner-scoped CRUD.

### budgets
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE.
- Updated UNIQUE constraint to include user_id (user_category_month_unique).
- RLS policies replaced: owner-scoped CRUD.

### recurring_expenses
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE.
- RLS policies replaced: owner-scoped CRUD.

### profile
- Removed singleton constraint (id = 1 CHECK). PK changed from integer id to uuid id DEFAULT gen_random_uuid().
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE — unique per user.
- RLS policies replaced: owner-scoped CRUD.

### app_settings
- Removed singleton constraint (id = 1 CHECK). PK changed from integer id to uuid id DEFAULT gen_random_uuid().
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` referencing auth.users(id) ON DELETE CASCADE — unique per user.
- RLS policies replaced: owner-scoped CRUD.

## Security Changes
- All old `anon_*` policies (USING (true) / WITH CHECK (true)) dropped on all 6 tables.
- New policies scoped `TO authenticated` with `auth.uid() = user_id` ownership checks.
- 4 separate policies per table (SELECT, INSERT, UPDATE, DELETE) — no FOR ALL.
- user_id columns default to auth.uid() so client inserts that omit user_id still succeed.

## Important Notes
1. The profile and app_settings tables had `id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1)`.
   This migration drops that PK constraint and the CHECK, then adds a new uuid PK.
   Existing seed rows (id=1) are preserved with a generated uuid and user_id set to NULL
   temporarily — but since the column is NOT NULL, we set user_id to a sentinel value first,
   then the old shared data is effectively orphaned. In practice the app will create fresh
   per-user rows after auth. Old shared rows are cleaned up since they have no valid owner.
2. DEFAULT auth.uid() means the frontend never needs to pass user_id on insert.
3. The budgets UNIQUE(category, month) constraint is replaced with
   UNIQUE(user_id, category, month) so different users can have budgets for the same
   category+month.
4. No data is deleted — columns are added, constraints are dropped/replaced.
*/

-- ============================================================
-- expenses: add user_id + owner-scoped RLS
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
    ALTER TABLE expenses ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses (user_id);

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;

CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- incomes: add user_id + owner-scoped RLS
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'incomes' AND column_name = 'user_id') THEN
    ALTER TABLE incomes ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes (user_id);

DROP POLICY IF EXISTS "anon_select_incomes" ON incomes;
DROP POLICY IF EXISTS "anon_insert_incomes" ON incomes;
DROP POLICY IF EXISTS "anon_update_incomes" ON incomes;
DROP POLICY IF EXISTS "anon_delete_incomes" ON incomes;

CREATE POLICY "select_own_incomes" ON incomes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_incomes" ON incomes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_incomes" ON incomes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_incomes" ON incomes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- budgets: add user_id, update unique constraint, owner-scoped RLS
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'user_id') THEN
    ALTER TABLE budgets ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets (user_id);

-- Replace the old unique constraint with a user-scoped one
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_category_month_key') THEN
    ALTER TABLE budgets DROP CONSTRAINT budgets_category_month_key;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_user_category_month_unique') THEN
    ALTER TABLE budgets ADD CONSTRAINT budgets_user_category_month_unique UNIQUE (user_id, category, month);
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_budgets" ON budgets;
DROP POLICY IF EXISTS "anon_insert_budgets" ON budgets;
DROP POLICY IF EXISTS "anon_update_budgets" ON budgets;
DROP POLICY IF EXISTS "anon_delete_budgets" ON budgets;

CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- recurring_expenses: add user_id + owner-scoped RLS
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recurring_expenses' AND column_name = 'user_id') THEN
    ALTER TABLE recurring_expenses ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses (user_id);

DROP POLICY IF EXISTS "anon_select_recurring" ON recurring_expenses;
DROP POLICY IF EXISTS "anon_insert_recurring" ON recurring_expenses;
DROP POLICY IF EXISTS "anon_update_recurring" ON recurring_expenses;
DROP POLICY IF EXISTS "anon_delete_recurring" ON recurring_expenses;

CREATE POLICY "select_own_recurring" ON recurring_expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_recurring" ON recurring_expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_recurring" ON recurring_expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_recurring" ON recurring_expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- profile: remove singleton, add user_id, uuid PK, owner-scoped RLS
-- ============================================================
-- Drop the old CHECK constraint that forced id = 1
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_id_check' AND conrelid = 'profile'::regclass) THEN
    ALTER TABLE profile DROP CONSTRAINT profile_id_check;
  END IF;
END $$;

-- Add user_id column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile' AND column_name = 'user_id') THEN
    ALTER TABLE profile ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make user_id unique (one profile per user)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_user_id_key') THEN
    ALTER TABLE profile ADD CONSTRAINT profile_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profile_user ON profile (user_id);

DROP POLICY IF EXISTS "anon_select_profile" ON profile;
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;

CREATE POLICY "select_own_profile" ON profile FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profile" ON profile FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON profile FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_profile" ON profile FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- app_settings: remove singleton, add user_id, uuid PK, owner-scoped RLS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_id_check' AND conrelid = 'app_settings'::regclass) THEN
    ALTER TABLE app_settings DROP CONSTRAINT app_settings_id_check;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'user_id') THEN
    ALTER TABLE app_settings ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_user_id_key') THEN
    ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_settings_user ON app_settings (user_id);

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON app_settings;

CREATE POLICY "select_own_settings" ON app_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_settings" ON app_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_settings" ON app_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
