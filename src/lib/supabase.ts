import { createClient } from '@supabase/supabase-js';

// Handle Vite environment variables
const getSupabaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta?.env) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  return null;
};

const getSupabaseAnonKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta?.env) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  return null;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    console.error('VITE_SUPABASE_URL must be a valid URL format: https://your-project-id.supabase.co');
  }
}

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

