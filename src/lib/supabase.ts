import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  user_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
};
