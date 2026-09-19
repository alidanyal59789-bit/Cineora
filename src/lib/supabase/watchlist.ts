import type { SupabaseClient } from "@supabase/supabase-js";
import type { TMDBMovie } from "@/lib/tmdb";

function isValidMovie(m: unknown): m is TMDBMovie {
  return (
    m !== null &&
    typeof m === "object" &&
    typeof (m as { id: unknown }).id === "number" &&
    typeof (m as { title: unknown }).title === "string"
  );
}

export async function fetchWatchlist(
  supabase: SupabaseClient,
  userId: string
): Promise<TMDBMovie[] | null> {
  try {
    const { data, error } = await supabase
      .from("watchlist_items")
      .select("movie")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return null;
    const movies = (data ?? [])
      .map((row) => (row as { movie: unknown }).movie)
      .filter(isValidMovie);
    return movies;
  } catch {
    return null;
  }
}

export async function upsertWatchlistItem(
  supabase: SupabaseClient,
  userId: string,
  movie: TMDBMovie
): Promise<void> {
  try {
    await supabase.from("watchlist_items").upsert(
      { user_id: userId, movie_id: movie.id, movie },
      { onConflict: "user_id,movie_id" }
    );
  } catch {}
}

export async function deleteWatchlistItem(
  supabase: SupabaseClient,
  userId: string,
  movieId: number
): Promise<void> {
  try {
    await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", movieId);
  } catch {}
}

export async function clearWatchlistRemote(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    await supabase.from("watchlist_items").delete().eq("user_id", userId);
  } catch {}
}
