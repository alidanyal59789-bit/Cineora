"use client";

import { useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

export default function SelectableMovieGrid({
  movies,
  genreMap,
  emptyMessage,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
  emptyMessage?: string;
}) {
  const searchParams = useSearchParams();
  const getGenreName = (ids: number[]) => genreMap[ids[0]] ?? "Trending";

  if (movies.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">🎬</div>
        <h3 className="mt-4 text-sm font-semibold text-white">No movies found</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">{emptyMessage ?? "Try a different filter."}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {movies.map((movie, idx) => {
        // Preserve q/genre/sort, add rec=ID for recommendations.
        // Native link (not div onClick) so taps work on mobile without hover/JS.
        const params = new URLSearchParams(searchParams.toString());
        params.set("rec", String(movie.id));
        const recHref = `/?${params.toString()}#recommended`;
        return (
          <div key={movie.id} className="group relative">
            <MovieCard movie={movie} genreName={getGenreName(movie.genre_ids)} index={idx} posterHref={recHref} />
            <p className="mt-2 text-center text-xs text-white/30">Click poster to recommend</p>
          </div>
        );
      })}
    </div>
  );
}
