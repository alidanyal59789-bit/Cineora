"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { TMDBMovie } from "@/lib/tmdb";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchCollections,
  createCollectionRemote,
  deleteCollectionRemote,
  addToCollectionRemote,
  removeFromCollectionRemote,
} from "@/lib/supabase/collections";

export type UserCollection = {
  id: string;
  name: string;
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
    ) as UserCollection[];
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
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const tempId = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newCol: UserCollection = {
        id: tempId,
        name: trimmed,
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
            const remoteId = await createCollectionRemote(supabase, userId, trimmed);
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
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    isInCollection,
  };
}
