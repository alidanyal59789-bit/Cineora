"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import type { TMDBMovie } from "@/lib/tmdb";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchCollections,
  createCollectionRemote,
  createCollectionRemoteDetailed,
  isRlsDenial,
  renameCollectionRemote,
  deleteCollectionRemote,
  addToCollectionRemote,
  removeFromCollectionRemote,
} from "@/lib/supabase/collections";

export type UserCollection = {
  id: string;
  name: string;
  description: string;
  movies: TMDBMovie[];
  createdAt: string;
};

const STORAGE_KEY = "cineora_collections";

function loadCollections(): UserCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c: unknown) =>
        c !== null &&
        typeof c === "object" &&
        "id" in (c as Record<string, unknown>) &&
        "name" in (c as Record<string, unknown>) &&
        "movies" in (c as Record<string, unknown>) &&
        Array.isArray((c as { movies: unknown }).movies)
    ).map((c) => ({
      ...(c as UserCollection),
      description:
        typeof (c as { description?: unknown }).description === "string"
          ? (c as { description: string }).description
          : "",
    })) as UserCollection[];
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return [];
  }
}

function saveCollections(list: UserCollection[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("cineora:collections"));
  } catch {}
}

export function useCollections() {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const userId = user?.id ?? null;

  useEffect(() => {
    setCollections(loadCollections());
    setIsLoaded(true);
  }, []);

  // Sync with Supabase when signed in. Migrate local-only (col_...) lists once.
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const remote = await fetchCollections(supabase, userId);
        if (cancelled || remote === null) return;
        const local = loadCollections();
        const localOnly = local.filter((c) => c.id.startsWith("col_"));
        if (localOnly.length > 0) {
          for (const c of localOnly) {
            const newId = await createCollectionRemote(supabase, userId, c.name);
            if (newId) {
              for (const m of c.movies) {
                await addToCollectionRemote(supabase, newId, m);
              }
            }
          }
          const refreshed = await fetchCollections(supabase, userId);
          if (!cancelled && refreshed !== null) {
            setCollections(refreshed);
            saveCollections(refreshed);
            return;
          }
        }
        if (!cancelled) {
          setCollections(remote);
          saveCollections(remote);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const handler = () => setCollections(loadCollections());
    window.addEventListener("storage", handler);
    window.addEventListener("cineora:collections", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cineora:collections", handler);
    };
  }, []);

  const createCollection = useCallback(
    (name: string, description = "") => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const tempId = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newCol: UserCollection = {
        id: tempId,
        name: trimmed,
        description: description.trim(),
        movies: [],
        createdAt: new Date().toISOString(),
      };
      setCollections((prev) => {
        const next = [...prev, newCol];
        saveCollections(next);
        return next;
      });
      if (userId && isSupabaseConfigured()) {
        (async () => {
          try {
            const supabase = createClient();
            const remoteId = await createCollectionRemote(supabase, userId, trimmed, description.trim());
            if (remoteId) {
              setCollections((prev) => {
                const next = prev.map((c) =>
                  c.id === tempId ? { ...c, id: remoteId } : c
                );
                saveCollections(next);
                return next;
              });
            }
          } catch {}
        })();
      }
      return tempId;
    },
    [userId]
  );

  // Remote-first create with real success/error feedback for signed-in UI.
  // Uses the live Supabase session (not a stale cached id) so an expired
  // mobile session yields a "sign in again" message instead of a silent RLS
  // denial. Guards against concurrent double submissions.
  const createInFlight = useRef(false);
  const createCollectionAsync = useCallback(
    async (
      name: string,
      description = ""
    ): Promise<{ ok: boolean; error?: string; id?: string }> => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Please enter a collection name." };
      if (trimmed.length > 60) {
        return { ok: false, error: "Collection name must be 60 characters or fewer." };
      }
      if (!userId || !isSupabaseConfigured()) {
        return { ok: false, error: "Please sign in to create collections." };
      }
      if (createInFlight.current) {
        return { ok: false, error: "Already creating — please wait a moment." };
      }
      createInFlight.current = true;
      try {
        const supabase = createClient();
        const { id: remoteId, error: remoteError } =
          await createCollectionRemoteDetailed(
            supabase,
            userId,
            trimmed,
            description.trim().slice(0, 140)
          );
        if (!remoteId) {
          if (remoteError?.code === "not_authenticated") {
            return { ok: false, error: "Your session expired. Please sign in again." };
          }
          if (remoteError && isRlsDenial(remoteError)) {
            return { ok: false, error: "Couldn't save — please sign in again and retry." };
          }
          if (
            remoteError &&
            (remoteError.message.toLowerCase().includes("fetch failed") ||
              remoteError.message.toLowerCase().includes("network") ||
              remoteError.message.toLowerCase().includes("timeout"))
          ) {
            return { ok: false, error: "Network issue. Check your connection and try again." };
          }
          if (process.env.NODE_ENV !== "production" && remoteError) {
            // Dev-only diagnostic: PII-free code, never secrets or tokens.
            console.warn(`[Collections] create failed (code=${remoteError.code})`);
          }
          return { ok: false, error: "Could not save the collection. Please try again." };
        }
        const refreshed = await fetchCollections(supabase, userId);
        if (refreshed !== null) {
          setCollections(refreshed);
          saveCollections(refreshed);
        }
        return { ok: true, id: remoteId };
      } catch {
        return { ok: false, error: "Could not save the collection. Please try again." };
      } finally {
        createInFlight.current = false;
      }
    },
    [userId]
  );

  const renameCollection = useCallback(
    (id: string, name: string, description = "") => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const descTrimmed = description.trim();
      setCollections((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, name: trimmed, description: descTrimmed } : c
        );
        saveCollections(next);
        return next;
      });
      if (userId && isSupabaseConfigured() && !id.startsWith("col_")) {
        (async () => {
          try {
            await renameCollectionRemote(createClient(), id, trimmed, descTrimmed);
          } catch {}
        })();
      }
    },
    [userId]
  );

  // Remote-first rename with real success/error feedback for signed-in UI.
  const renameCollectionAsync = useCallback(
    async (
      id: string,
      name: string,
      description = ""
    ): Promise<{ ok: boolean; error?: string }> => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Please enter a collection name." };
      if (!userId || !isSupabaseConfigured() || id.startsWith("col_")) {
        renameCollection(id, trimmed, description);
        return { ok: true };
      }
      try {
        const ok = await renameCollectionRemote(createClient(), id, trimmed, description.trim());
        if (!ok) return { ok: false, error: "Could not rename the collection. Please try again." };
        setCollections((prev) => {
          const next = prev.map((c) =>
            c.id === id ? { ...c, name: trimmed, description: description.trim() } : c
          );
          saveCollections(next);
          return next;
        });
        return { ok: true };
      } catch {
        return { ok: false, error: "Could not rename the collection. Please try again." };
      }
    },
    [userId, renameCollection]
  );

  const refreshCollections = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) {
      setCollections(loadCollections());
      return;
    }
    try {
      const remote = await fetchCollections(createClient(), userId);
      if (remote !== null) {
        setCollections(remote);
        saveCollections(remote);
      }
    } catch {}
  }, [userId]);

  const deleteCollection = useCallback(
    (id: string) => {
      setCollections((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveCollections(next);
        return next;
      });
      if (userId && isSupabaseConfigured() && !id.startsWith("col_")) {
        try {
          void deleteCollectionRemote(createClient(), id);
        } catch {}
      }
    },
    [userId]
  );

  const addToCollection = useCallback(
    (collectionId: string, movie: TMDBMovie) => {
      setCollections((prev) => {
        const next = prev.map((c) => {
          if (c.id !== collectionId) return c;
          if (c.movies.some((m) => m.id === movie.id)) return c; // prevent duplicate
          return { ...c, movies: [...c.movies, movie] };
        });
        saveCollections(next);
        return next;
      });
      if (userId && isSupabaseConfigured()) {
        try {
          void addToCollectionRemote(createClient(), collectionId, movie);
        } catch {}
      }
    },
    [userId]
  );

  const removeFromCollection = useCallback(
    (collectionId: string, movieId: number) => {
      setCollections((prev) => {
        const next = prev.map((c) => {
          if (c.id !== collectionId) return c;
          return { ...c, movies: c.movies.filter((m) => m.id !== movieId) };
        });
        saveCollections(next);
        return next;
      });
      if (userId && isSupabaseConfigured()) {
        try {
          void removeFromCollectionRemote(createClient(), collectionId, movieId);
        } catch {}
      }
    },
    [userId]
  );

  const isInCollection = useCallback(
    (collectionId: string, movieId: number) => {
      const col = collections.find((c) => c.id === collectionId);
      return col ? col.movies.some((m) => m.id === movieId) : false;
    },
    [collections]
  );

  return {
    collections,
    isLoaded,
    user,
    createCollection,
    createCollectionAsync,
    renameCollection,
    renameCollectionAsync,
    refreshCollections,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    isInCollection,
  };
}
