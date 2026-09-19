import type { SupabaseClient } from "@supabase/supabase-js";
import type { TMDBMovie } from "@/lib/tmdb";
import type { UserCollection } from "@/hooks/useCollections";

type CollectionRow = {
  id: string;
  name: string;
  created_at: string;
};

type CollectionItemRow = {
  collection_id: string;
  movie: unknown;
};

function isValidMovie(m: unknown): m is TMDBMovie {
  return (
    m !== null &&
    typeof m === "object" &&
    typeof (m as { id: unknown }).id === "number" &&
    typeof (m as { title: unknown }).title === "string"
  );
}

export async function fetchCollections(
  supabase: SupabaseClient,
  userId: string
): Promise<UserCollection[] | null> {
  try {
    const { data: cols, error: colError } = await supabase
      .from("collections")
      .select("id,name,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (colError) return null;
    const rows = (cols ?? []) as CollectionRow[];
    if (rows.length === 0) return [];
    const { data: items, error: itemError } = await supabase
      .from("collection_items")
      .select("collection_id,movie")
      .in(
        "collection_id",
        rows.map((c) => c.id)
      );
    if (itemError) return null;
    const byCollection = new Map<string, TMDBMovie[]>();
    for (const row of ((items ?? []) as CollectionItemRow[])) {
      const movie = row.movie;
      if (!isValidMovie(movie)) continue;
      const list = byCollection.get(row.collection_id) ?? [];
      if (!list.some((m) => m.id === movie.id)) list.push(movie);
      byCollection.set(row.collection_id, list);
    }
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
      movies: byCollection.get(c.id) ?? [],
    }));
  } catch {
    return null;
  }
}

export async function createCollectionRemote(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: userId, name })
      .select("id")
      .single();
    if (error) return null;
    return (data as { id: string }).id;
  } catch {
    return null;
  }
}

export async function deleteCollectionRemote(
  supabase: SupabaseClient,
  collectionId: string
): Promise<void> {
  try {
    await supabase.from("collections").delete().eq("id", collectionId);
  } catch {}
}

export async function addToCollectionRemote(
  supabase: SupabaseClient,
  collectionId: string,
  movie: TMDBMovie
): Promise<void> {
  try {
    // Skip local-only ids (col_...) - they have no remote row.
    if (collectionId.startsWith("col_")) return;
    await supabase.from("collection_items").upsert(
      { collection_id: collectionId, movie_id: movie.id, movie },
      { onConflict: "collection_id,movie_id" }
    );
  } catch {}
}

export async function removeFromCollectionRemote(
  supabase: SupabaseClient,
  collectionId: string,
  movieId: number
): Promise<void> {
  try {
    if (collectionId.startsWith("col_")) return;
    await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("movie_id", movieId);
  } catch {}
}
