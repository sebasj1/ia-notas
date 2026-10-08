/*
# Add categories support to notes

1. New Tables
- `categories`
  - `id` (uuid, primary key)
  - `name` (text, not null) — category name
  - `color` (text, not null, defaults to 'blue') — accent color matching the note color palette
  - `user_id` (uuid, not null, defaults to auth.uid()) — owner of the category, references auth.users
  - `created_at` (timestamptz, defaults to now())

2. Modified Tables
- `notes` — add `category_id` (uuid, nullable) referencing `categories(id) ON DELETE SET NULL`

3. Security
- Enable RLS on `categories`.
- Owner-scoped CRUD: each authenticated user can only access their own categories.
- 4 separate policies: SELECT, INSERT, UPDATE, DELETE — all scoped to `authenticated` with `auth.uid() = user_id`.

4. Indexes
- Index on `categories.user_id` for fast per-user queries.

5. Important Notes
- `category_id` on notes is nullable so existing notes without a category are unaffected.
- `ON DELETE SET NULL` ensures deleting a category doesn't delete the notes — it just removes the assignment.
- `user_id` on categories has `DEFAULT auth.uid()` so frontend inserts that omit `user_id` still work.
- Each user gets their own private categories.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Add category_id column to notes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE notes ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;