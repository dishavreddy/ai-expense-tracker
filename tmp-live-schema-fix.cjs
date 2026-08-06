const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ccybmzelitxzpvuaszph.supabase.co', 'sb_publishable_LpgoPSUkASgJ4v4EOt3EFQ_5E9QZlpb', {
  auth: { persistSession: false, autoRefreshToken: false }
});

(async () => {
  const sqls = [
    "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE incomes ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;",
    "ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_id_check;",
    "ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_id_check;",
    "ALTER TABLE profile ALTER COLUMN user_id SET NOT NULL;",
    "ALTER TABLE app_settings ALTER COLUMN user_id SET NOT NULL;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_user_id_key') THEN ALTER TABLE profile ADD CONSTRAINT profile_user_id_key UNIQUE (user_id); END IF; END $$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_user_id_key') THEN ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_key UNIQUE (user_id); END IF; END $$;"
  ];

  for (const sql of sqls) {
    const { error } = await supabase.rpc('exec_sql', { sql });
    console.log('SQL:', sql);
    if (error) {
      console.log('ERROR:', error.message);
      break;
    }
    console.log('OK');
  }
})();
