import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const configured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = configured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient("http://localhost", "public-anon-key") as SupabaseClient);

export const isSupabaseConfigured = (): boolean => configured;
