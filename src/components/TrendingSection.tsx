"use client";

import { useState, useMemo } from "react";
import MovieCard from "@/components/MovieCard";
import GenreFilter from "@/components/GenreFilter";
import type { TMDBMovie } from "@/lib/tmdb";

export default function TrendingSection({
  movies,
  genreMap,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
}) {
  const [activeGenre, setActiveGenre] = useState("All");

  const filtered = useMemo(() => {
    if (activeGenre === "All") return movies;
    // Find genre id for active name
    const entry = Object.entries(genreMap).find(([, name]) => name === activeGenre);
    if (!entry) return [];
    const genreId = Number(entry[0]);
    return movies.filter((m) => m.genre_ids.includes(genreId));
  }, [activeGenre, movies, genreMap]);

  const getGenreName = (ids: number[]) => {
    if (!ids?.length) return "Trending";
    return genreMap[ids[0]] ?? "Trending";
  };

  return (
    <section id="trending" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Trending Now</h2>
          <p className="mt-1.5 text-sm text-white/50">Live from TMDB • Updates hourly • Server-side fetch</p>
        </div>
        <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white">
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </a>
      </div>

      <div className="mt-6">
        <GenreFilter onChange={setActiveGenre} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm text-white/60">No movies in “{activeGenre}” in today&apos;s trending. Try “All”.</p>
          <button onClick={() => setActiveGenre("All")} className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
            Show All
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {filtered.map((movie, idx) => (
            <MovieCard key={movie.id} movie={movie} genreName={getGenreName(movie.genre_ids)} index={idx} />
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:gap-6 sm:p-5">
        <div className="text-center sm:text-left">
          <p className="text-xl font-bold sm:text-2xl">{movies.length}+</p>
          <p className="text-xs text-white/40">Live TMDB titles</p>
        </div>
        <div className="text-center border-x border-white/5 sm:text-left sm:pl-6">
          <p className="text-xl font-bold sm:text-2xl">4.9/5</p>
          <p className="text-xs text-white/40">Average user rating</p>
        </div>
        <div className="text-center sm:text-left sm:pl-6">
          <p className="text-xl font-bold sm:text-2xl">Secure</p>
          <p className="text-xs text-white/40">Key hidden on server</p>
        </div>
      </div>
    </section>
  );
}
