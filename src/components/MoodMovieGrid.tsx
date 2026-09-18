"use client";

import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

export default function MoodMovieGrid({
  movies,
  genreMap,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
}) {
  const router = useRouter();
  const getGenreName = (ids: number[]) => genreMap[ids[0]] ?? "Trending";

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {movies.map((m, idx) => {
        const handlePosterClick = () => {
          router.push(`/movie/${m.id}`);
        };
        return (
          <div
            key={m.id}
            className="group relative cursor-pointer"
            onClick={handlePosterClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePosterClick();
            }}
          >
            <MovieCard movie={m} genreName={getGenreName(m.genre_ids)} index={idx} />
          </div>
        );
      })}
    </div>
  );
}
