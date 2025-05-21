
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and anon key for your project
const supabaseUrl = 'https://twcandgazzzbbrmffstt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Y2FuZGdhenp6YmJybWZmc3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjIxMTgsImV4cCI6MjA2MzQzODExOH0.vYKHCLERTTzeshRpNy5Wr_sZ2bezW2Yz7BaY149MTcs';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

export { supabase };
