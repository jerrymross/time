-- ============================================================
-- Arbetstidsregistrering – Supabase databasschema
-- Säker att köra flera gånger (idempotent)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELLER
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_entries (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
  task_description   TEXT,
  entry_date         DATE NOT NULL,
  start_time         TIME NOT NULL,
  end_time           TIME NOT NULL,
  duration_minutes   INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_timers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_goal_hours  NUMERIC(6,2) NOT NULL DEFAULT 160,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id      ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id    ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_category   ON time_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_active_timers_user_id   ON active_timers(user_id);

-- ============================================================
-- TRIGGER: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at     ON profiles;
DROP TRIGGER IF EXISTS trg_time_entries_updated_at ON time_entries;
DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- TRIGGER: skapa profil + kategorier vid ny användare
-- Felhantering med EXCEPTION så att användarregistrering
-- aldrig blockeras även om något oväntat händer.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, color) VALUES
    (NEW.id, 'Undervisning', '#3B82F6'),
    (NEW.id, 'Marknad',      '#10B981')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_settings (user_id, monthly_goal_hours)
  VALUES (NEW.id, 160)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logga felet men blockera aldrig registreringen
  RAISE WARNING 'handle_new_user fel för användare %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- categories
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() = user_id);

-- time_entries
DROP POLICY IF EXISTS "entries_select" ON time_entries;
DROP POLICY IF EXISTS "entries_insert" ON time_entries;
DROP POLICY IF EXISTS "entries_update" ON time_entries;
DROP POLICY IF EXISTS "entries_delete" ON time_entries;
CREATE POLICY "entries_select" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "entries_insert" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_update" ON time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "entries_delete" ON time_entries FOR DELETE USING (auth.uid() = user_id);

-- active_timers
DROP POLICY IF EXISTS "timers_select" ON active_timers;
DROP POLICY IF EXISTS "timers_insert" ON active_timers;
DROP POLICY IF EXISTS "timers_update" ON active_timers;
DROP POLICY IF EXISTS "timers_delete" ON active_timers;
CREATE POLICY "timers_select" ON active_timers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timers_insert" ON active_timers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timers_update" ON active_timers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timers_delete" ON active_timers FOR DELETE USING (auth.uid() = user_id);

-- user_settings
DROP POLICY IF EXISTS "settings_select" ON user_settings;
DROP POLICY IF EXISTS "settings_insert" ON user_settings;
DROP POLICY IF EXISTS "settings_update" ON user_settings;
CREATE POLICY "settings_select" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TODOS
-- ============================================================

CREATE TABLE IF NOT EXISTS todos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  priority     TEXT NOT NULL DEFAULT 'medel' CHECK (priority IN ('hög', 'medel', 'låg')),
  deadline     DATE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todos_user_id   ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_deadline  ON todos(deadline);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

DROP TRIGGER IF EXISTS trg_todos_updated_at ON todos;
CREATE TRIGGER trg_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "todos_select" ON todos;
DROP POLICY IF EXISTS "todos_insert" ON todos;
DROP POLICY IF EXISTS "todos_update" ON todos;
DROP POLICY IF EXISTS "todos_delete" ON todos;
CREATE POLICY "todos_select" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "todos_insert" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_update" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "todos_delete" ON todos FOR DELETE USING (auth.uid() = user_id);
