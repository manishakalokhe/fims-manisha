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

// Enhanced validation and error reporting
const validateSupabaseConfig = () => {
  const errors = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing from environment variables');
  } else if (!isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL must be a valid URL format (e.g., https://your-project-id.supabase.co)');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  } else if (supabaseAnonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  return errors;
};

const configErrors = validateSupabaseConfig();
if (configErrors.length > 0) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Configuration errors:');
  configErrors.forEach(error => console.error(`- ${error}`));
  console.error('\nTo fix this:');
  console.error('1. Create a .env file in your project root');
  console.error('2. Add the following variables:');
  console.error('   VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('3. Get these values from your Supabase project dashboard');
  console.error('4. Restart the development server');
}

// Create Supabase client only if environment variables are valid
export const supabase = configErrors.length === 0 ? createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'fims-app'
    }
  }
}) : null;

// Export configuration status for components to check
export const isSupabaseConfigured = configErrors.length === 0;
export const supabaseConfigErrors = configErrors;