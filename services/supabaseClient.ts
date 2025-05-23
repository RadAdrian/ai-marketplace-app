import { createClient } from '@supabase/supabase-js';

// Ensure window.ENV is defined and has the necessary properties
const env = (window as any).ENV || {};
const supabaseUrlFromEnv = env.SUPABASE_URL;
const supabaseAnonKeyFromEnv = env.SUPABASE_ANON_KEY;

if (!supabaseUrlFromEnv || !supabaseAnonKeyFromEnv) {
  console.error(
    "Supabase URL or Anon Key is not defined in window.ENV. " +
    "Ensure env-config.js is loaded and configured correctly."
  );
}

export const supabase = createClient(
  supabaseUrlFromEnv || "MISSING_SUPABASE_URL_FROM_ENV", 
  supabaseAnonKeyFromEnv || "MISSING_SUPABASE_ANON_KEY_FROM_ENV"
);