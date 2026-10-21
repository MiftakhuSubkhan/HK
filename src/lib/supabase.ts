import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hakaypwmopmiupbpjrbe.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhha2F5cHdtb3BtaXVwYnBqcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MzI3MTYsImV4cCI6MjEwODEwODcxNn0.GaTN0SRPmdhpLY6fBjs5L3NI1C900skhEs4hkfj3KbU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.trim() !== '' &&
      supabaseAnonKey.trim() !== '' &&
      !supabaseUrl.includes('placeholder')
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
