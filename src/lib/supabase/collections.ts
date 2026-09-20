import type { SupabaseClient } from "@supabase/supabase-js";
import type { TMDBMovie } from "@/lib/tmdb";
import type { UserCollection } from "@/hooks/useCollections";

type CollectionRow = {
  id: string;
  name: string;
  description?: string | null;
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

function mentionsDescription(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return msg.toLowerCase().includes("description");
}

function toCollection(row: CollectionRow, movies: TMDBMovie[]): UserCollection {
  return {
    id: row.id,
    name: row.name,
    description: typeof row.description === "string" ? row.description : "",
    createdAt: row.created_at,
    movies,
  };
}

// Classified, PII-free diagnostic for a failed remote write. Never includes
// tokens, emails, or full payloads - only the PostgREST code/message/hint.
export type CollectionRemoteError = {
  code: string;
  message: string;
  hint: string | null;
};

function toRemoteError(error: unknown): CollectionRemoteError {
  const e = error as { code?: unknown; message?: unknown; hint?: unknown } | null;
  const code =
    typeof e?.code === "string" && e.code.length > 0 ? e.code : "unknown";
  const rawMessage =
    typeof e?.message === "string" && e.message.length > 0
      ? e.message
      : "Unknown database error.";
  const hint =
    typeof e?.hint === "string" && e.hint.length > 0 ? e.hint : null;
  return { code, message: rawMessage.slice(0, 300), hint };
}

function devLog(action: string, error: CollectionRemoteError) {
  // Development-only diagnostic. Safe: code/message/hint from PostgREST
  // contain no secrets; never log user ids, emails, or tokens here.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[Collections] ${action} failed (code=${error.code}): ${error.message}`
    );
  }
}

function isRlsDenial(error: CollectionRemoteError): boolean {
  return (
    error.code === "42501" ||
    error.message.toLowerCase().includes("row-level security") ||
    error.message.toLowerCase().includes("violates") ||
    error.message.toLowerCase().includes("policy")
  );
}

export async function fetchCollections(
  supabase: SupabaseClient,
  userId: string
): Promise<UserCollection[] | null> {
  try {
    // Prefer the description column (migration 0002); fall back gracefully
    // if it has not been applied yet.
    let cols: CollectionRow[] | null = null;
    const first = await supabase
      .from("collections")
      .select("id,name,description,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (first.error) {
      if (!mentionsDescription(first.error)) return null;
      const fallback = await supabase
        .from("collections")
        .select("id,name,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (fallback.error) return null;
      cols = (fallback.data ?? []) as CollectionRow[];
    } else {
      cols = (first.data ?? []) as CollectionRow[];
    }
    const rows = cols ?? [];
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
    return rows.map((c) => toCollection(c, byCollection.get(c.id) ?? []));
  } catch {
    return null;
  }
}

export async function createCollectionRemote(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  description = ""
): Promise<string | null> {
  const res = await createCollectionRemoteDetailed(supabase, userId, name, description);
  return res.id;
}

/**
 * Remote-first create with diagnostics. Verifies the *live* Supabase session
 * (not a possibly stale cached user id) before inserting, so an expired
 * mobile session surfaces as `not_authenticated` instead of a silent RLS
 * denial. The insert uses the live session's user id, guaranteeing
 * `auth.uid() = user_id` for the `collections_owner` RLS policy.
 */
export async function createCollectionRemoteDetailed(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  description = ""
): Promise<{ id: string | null; error?: CollectionRemoteError }> {
  try {
    // Live session check - the cached hook user id may be stale (e.g. mobile
    // tab backgrounded, token expired). RLS needs a valid session.
    const { data: sessionData } = await supabase.auth.getUser();
    const liveUserId = sessionData?.user?.id ?? null;
    if (!liveUserId) {
      const err: CollectionRemoteError = {
        code: "not_authenticated",
        message: "No active session.",
        hint: null,
      };
      devLog("create", err);
      return { id: null, error: err };
    }
    const ownerId = liveUserId === userId ? userId : liveUserId;
    const payload = { user_id: ownerId, name, description };
    const first = await supabase
      .from("collections")
      .insert(payload)
      .select("id")
      .single();
    if (!first.error) return { id: (first.data as { id: string }).id };
    if (!mentionsDescription(first.error)) {
      const err = toRemoteError(first.error);
      devLog("create", err);
      return { id: null, error: err };
    }
    const fallback = await supabase
      .from("collections")
      .insert({ user_id: ownerId, name })
      .select("id")
      .single();
    if (fallback.error) {
      const err = toRemoteError(fallback.error);
      devLog("create", err);
      return { id: null, error: err };
    }
    return { id: (fallback.data as { id: string }).id };
  } catch (e) {
    const err = toRemoteError(e);
    devLog("create", err);
    return { id: null, error: err };
  }
}

export { isRlsDenial };

export async function renameCollectionRemote(
  supabase: SupabaseClient,
  collectionId: string,
  name: string,
  description = ""
): Promise<boolean> {
  try {
    const first = await supabase
      .from("collections")
      .update({ name, description })
      .eq("id", collectionId);
    if (!first.error) return true;
    if (!mentionsDescription(first.error)) return false;
    const fallback = await supabase
      .from("collections")
      .update({ name })
      .eq("id", collectionId);
    return !fallback.error;
  } catch {
    return false;
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
