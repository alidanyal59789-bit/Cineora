export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    typeof url === "string" &&
    url.length > 0 &&
    url.startsWith("http") &&
    typeof key === "string" &&
    key.length > 0
  );
}
