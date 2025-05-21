
import { createClient } from '@supabase/supabase-js';

// Supabase client with public API key (safe to use in browser)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
