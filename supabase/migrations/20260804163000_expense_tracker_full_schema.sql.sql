/*
# Expense Tracker Full Schema

## Overview
Creates the complete database schema for a single-tenant AI expense tracker
with no authentication. All tables are world-readable/writable by the anon
role since this is a personal single-user app with no sign-in screen.

## New Tables
1. `expenses` — individual expense transactions (amount, description, category, date, type)
2. `incomes` — income transactions (amount, source, date)
3. `budgets` — monthly category budgets (category, month, limit)
4. `recurring_expenses` — recurring expense templates (description, amount, category, frequency, next_date)
5. `profile` — single-row user profile (name, email)
6. `app_settings` — single-row app settings (currency, monthly_income, theme)

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant app with no sign-in — the data is intentionally
  shared/public for the anon-key frontend client.

## Important Notes
1. The `expenses` table has a `type` column defaulting to 'expense' to support
   future income-as-expense-row patterns, but incomes are stored separately.
2. `budgets` uses a `month` string (YYYY-MM) for easy filtering.
3. `recurring_expenses` has `next_date` to track when the next auto-generation should happen.
4. `profile` and `app_settings` are single-row tables enforced by a constraint.
*/

-- ============================================================
-- expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  date date NOT NULL DEFAULT CURRENT_DATE,
  emoji text NOT NULL DEFAULT '💰',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);

-- ============================================================
-- incomes
-- ============================================================
CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL CHECK (amount > 0),
  source text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_incomes" ON incomes;
CREATE POLICY "anon_select_incomes" ON incomes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_incomes" ON incomes;
CREATE POLICY "anon_insert_incomes" ON incomes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_incomes" ON incomes;
CREATE POLICY "anon_update_incomes" ON incomes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_incomes" ON incomes;
CREATE POLICY "anon_delete_incomes" ON incomes FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes (date DESC);

-- ============================================================
-- budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  month text NOT NULL,
  limit_amount numeric NOT NULL CHECK (limit_amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_budgets" ON budgets;
CREATE POLICY "anon_select_budgets" ON budgets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_budgets" ON budgets;
CREATE POLICY "anon_insert_budgets" ON budgets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_budgets" ON budgets;
CREATE POLICY "anon_update_budgets" ON budgets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_budgets" ON budgets;
CREATE POLICY "anon_delete_budgets" ON budgets FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets (month);

-- ============================================================
-- recurring_expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL CHECK (amount > 0),
  category text NOT NULL DEFAULT 'other',
  emoji text NOT NULL DEFAULT '💰',
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily','weekly','monthly')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  next_date date NOT NULL DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recurring" ON recurring_expenses;
CREATE POLICY "anon_select_recurring" ON recurring_expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recurring" ON recurring_expenses;
CREATE POLICY "anon_insert_recurring" ON recurring_expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recurring" ON recurring_expenses;
CREATE POLICY "anon_update_recurring" ON recurring_expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recurring" ON recurring_expenses;
CREATE POLICY "anon_delete_recurring" ON recurring_expenses FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- profile (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profile" ON profile;
CREATE POLICY "anon_select_profile" ON profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
CREATE POLICY "anon_insert_profile" ON profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profile" ON profile;
CREATE POLICY "anon_update_profile" ON profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed a default empty profile row if none exists
INSERT INTO profile (id, name, email) VALUES (1, '', '')
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- app_settings (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  currency text NOT NULL DEFAULT 'INR',
  monthly_income numeric NOT NULL DEFAULT 0,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
CREATE POLICY "anon_insert_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
CREATE POLICY "anon_update_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default settings
INSERT INTO app_settings (id, currency, monthly_income, theme) VALUES (1, 'INR', 0, 'light')
  ON CONFLICT (id) DO NOTHING;
