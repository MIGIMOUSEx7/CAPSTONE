import { createClient } from '@supabase/supabase-js'

// Project defaults (can be overridden via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yyrmuaocpnrlkeedwpzx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vSgs7UPknvfBsjXvrEtk0Q_Nh7m7I1-'
// Supabase REST endpoint (useful for direct REST calls)
export const SUPABASE_REST_URL = import.meta.env.VITE_SUPABASE_REST_URL || 'https://yyrmuaocpnrlkeedwpzx.supabase.co/rest/v1/'

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using default Supabase anon key from integration settings. Set VITE_SUPABASE_ANON_KEY in .env to override.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'