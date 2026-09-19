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

// Validated accessor - throws a safe error naming the missing variable
// without ever including secret values.
export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missing: string[] = [];
  if (typeof url !== "string" || url.length === 0 || !url.startsWith("http")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (typeof key !== "string" || key.length === 0) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (missing.length > 0) {
    throw new Error(
      `Supabase is not configured (missing: ${missing.join(", ")}).`
    );
  }
  return { url: url as string, key: key as string };
}
