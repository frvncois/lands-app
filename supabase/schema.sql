-- ============================================================
-- Lands — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- ── cleanup ──────────────────────────────────────────────────
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS land_themes CASCADE;
DROP TRIGGER IF EXISTS on_land_created ON lands;
DROP FUNCTION IF EXISTS handle_new_land();


-- ── profiles ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  avatar_image  TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

GRANT INSERT ON public.profiles TO supabase_auth_admin;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── lands ────────────────────────────────────────────────────
-- sections and theme live as JSONB directly on the land row.

CREATE TABLE IF NOT EXISTS lands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle        TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  avatar_image  TEXT NOT NULL DEFAULT '',
  cover_image   TEXT NOT NULL DEFAULT '',
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
  sections      JSONB NOT NULL DEFAULT '[]',
  theme         JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist when re-running on an existing table
ALTER TABLE lands ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]';
ALTER TABLE lands ADD COLUMN IF NOT EXISTS theme    JSONB NOT NULL DEFAULT '{}';

ALTER TABLE lands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own lands" ON lands;
CREATE POLICY "Users can read own lands"
  ON lands FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lands" ON lands;
CREATE POLICY "Users can insert own lands"
  ON lands FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lands" ON lands;
CREATE POLICY "Users can update own lands"
  ON lands FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lands" ON lands;
CREATE POLICY "Users can delete own lands"
  ON lands FOR DELETE USING (auth.uid() = user_id);


-- ── collaborators ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS collaborators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  land_id     UUID NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at   TIMESTAMPTZ,
  UNIQUE (land_id, email)
);

ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Land owners can manage collaborators" ON collaborators;
CREATE POLICY "Land owners can manage collaborators"
  ON collaborators FOR ALL USING (
    EXISTS (SELECT 1 FROM lands WHERE lands.id = collaborators.land_id AND lands.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Collaborators can read their own invites" ON collaborators;
CREATE POLICY "Collaborators can read their own invites"
  ON collaborators FOR SELECT USING (
    email = auth.email()
  );
