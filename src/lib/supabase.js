import { createClient } from '@supabase/supabase-js'

// Vite uses 'import.meta.env' to access your secret keys
// These MUST start with VITE_ to be visible to your React code
console.log("env", import.meta.env.VITE_SUPABASE_ANON_KEY)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This checks if you actually added the keys to your .env file
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing! Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)