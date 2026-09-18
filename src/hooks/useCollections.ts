"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { TMDBMovie } from "@/lib/tmdb";

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

  useEffect(() => {
    setCollections(loadCollections());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handler = () => setCollections(loadCollections());
    window.addEventListener("storage", handler);
    window.addEventListener("cineora:collections", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("cineora:collections", handler);
    };
  }, []);

  const createCollection = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const newCol: UserCollection = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      movies: [],
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => {
      const next = [...prev, newCol];
      saveCollections(next);
      return next;
    });
    return newCol.id;
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCollections(next);
      return next;
    });
  }, []);

  const addToCollection = useCallback((collectionId: string, movie: TMDBMovie) => {
    setCollections((prev) => {
      const next = prev.map((c) => {
        if (c.id !== collectionId) return c;
        if (c.movies.some((m) => m.id === movie.id)) return c; // prevent duplicate
        return { ...c, movies: [...c.movies, movie] };
      });
      saveCollections(next);
      return next;
    });
  }, []);

  const removeFromCollection = useCallback((collectionId: string, movieId: number) => {
    setCollections((prev) => {
      const next = prev.map((c) => {
        if (c.id !== collectionId) return c;
        return { ...c, movies: c.movies.filter((m) => m.id !== movieId) };
      });
      saveCollections(next);
      return next;
    });
  }, []);

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
