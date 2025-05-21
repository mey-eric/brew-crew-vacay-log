
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development, we'll provide a fallback mechanism when the environment variables are not set
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anonymous Key not found in environment variables. ' +
    'Using a mock Supabase client. Please set up your Supabase environment variables.'
  );
  
  // Create a mock Supabase client with placeholder methods
  supabase = {
    auth: {
      signInWithPassword: async () => ({ data: { user: { id: '1', email: 'demo@example.com' } }, error: null }),
      signUp: async () => ({ data: { user: { id: '1', email: 'demo@example.com' } }, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table) => ({
      select: () => ({
        single: async () => ({ data: { name: 'Demo User' }, error: null }),
        eq: () => ({
          single: async () => ({ data: { name: 'Demo User' }, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: '1', name: 'Demo User' }, error: null }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: () => {},
  };
} else {
  // Create actual Supabase client when environment variables are available
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
