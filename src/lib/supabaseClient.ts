import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes("your_supabase") || anonKey.includes("your_supabase")) {
    console.warn("Supabase environment variables are placeholder or missing. Auth will be disabled/mocked.");
    return null;
  }
  cachedClient = createClient(url, anonKey);
  return cachedClient;
}

