"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { TMDBMovie } from "@/lib/tmdb";

const STORAGE_KEY = "cineora_watchlist";

// Safe parse - handles invalid JSON, missing data, wrong shape
function loadWatchlist(): TMDBMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each item has required fields and correct movie id
    const valid = parsed.filter(
      (m: unknown) =>
        m !== null &&
        typeof m === "object" &&
        "id" in (m as Record<string, unknown>) &&
        typeof (m as { id: unknown }).id === "number" &&
        "title" in (m as Record<string, unknown>) &&
        typeof (m as { title: unknown }).title === "string"
    ) as TMDBMovie[];
    return valid;
  } catch {
    // Corrupted data - clear it safely
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return [];
  }
}

function saveWatchlist(list: TMDBMovie[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Dispatch custom event so other components update (same tab)
    window.dispatchEvent(new Event("cineora:watchlist"));
  } catch {}
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<TMDBMovie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load on mount (client only)
  useEffect(() => {
    setWatchlist(loadWatchlist());
    setIsLoaded(true);
  }, []);

  // Listen for changes from other tabs or same-tab custom event
  useEffect(() => {
    const handler = () => setWatchlist(loadWatchlist());
    window.addEventListener("storage", handler);
    window.addEventListener("cineora:watchlist", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cineora:watchlist", handler);
    };
  }, []);

  const isInWatchlist = useCallback(
    (id: number) => watchlist.some((m) => m.id === id),
    [watchlist]
  );

  const addToWatchlist = useCallback(
    (movie: TMDBMovie) => {
      setWatchlist((prev) => {
        if (prev.some((m) => m.id === movie.id)) return prev; // prevent duplicate
        const next = [...prev, movie];
        saveWatchlist(next);
        return next;
      });
    },
    []
  );

  const removeFromWatchlist = useCallback((id: number) => {
    setWatchlist((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const toggleWatchlist = useCallback(
    (movie: TMDBMovie) => {
      if (isInWatchlist(movie.id)) removeFromWatchlist(movie.id);
      else addToWatchlist(movie);
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    saveWatchlist([]);
  }, []);

  return {
    watchlist,
    isLoaded,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    count: watchlist.length,
  };
}
