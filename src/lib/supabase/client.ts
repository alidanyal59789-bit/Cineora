import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/config";

export function createClient() {
  // Validates names only - never prints secret values.
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
