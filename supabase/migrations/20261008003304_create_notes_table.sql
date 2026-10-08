/*
# Create notes table (multi-user, owner-scoped)

1. New Tables
- `notes`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short title for the note
  - `content` (text, not null, defaults to empty string) — body of the note
  - `color` (text, defaults to 'default') — accent color for visual categorization
  - `pinned` (boolean, defaults to false) — whether the note is pinned to the top
  - `user_id` (uuid, not null, defaults to auth.uid()) — owner of the note, references auth.users
  - `created_at` (timestamptz, defaults to now()) — creation timestamp
  - `updated_at` (timestamptz, defaults to now()) — last modification timestamp

2. Security
- Enable RLS on `notes`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- 4 separate policies: SELECT, INSERT, UPDATE, DELETE — all scoped to `authenticated` with `auth.uid() = user_id`.

3. Indexes
- Index on `user_id` for fast per-user queries.
- Index on `pinned` for sorting pinned notes first.
- Index on `updated_at` for sorting by recent activity.

4. Important Notes
- `user_id` has `DEFAULT auth.uid()` so frontend inserts that omit `user_id` still satisfy the INSERT WITH CHECK.
- `updated_at` is updated via a trigger on every UPDATE to keep it accurate.
*/

-- Ensure the helper function exists first (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'default',
  pinned boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notes" ON notes;
CREATE POLICY "select_own_notes" ON notes FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON notes;
CREATE POLICY "insert_own_notes" ON notes FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON notes;
CREATE POLICY "update_own_notes" ON notes FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON notes;
CREATE POLICY "delete_own_notes" ON notes FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- Auto-update updated_at on row modification
DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();