import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

export default function RecGrid({
  movies,
  genreMap,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
}) {
  const getGenreName = (ids: number[]) => genreMap[ids[0]] ?? "Trending";

  // Poster/title go to /movie/[id] (default inside MovieCard); the explicit
  // link below preserves the one-tap recommendation refresh flow.
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {movies.map((m, idx) => (
        <div key={m.id} className="group relative">
          <MovieCard movie={m} genreName={getGenreName(m.genre_ids)} index={idx} />
          <p className="mt-2 text-center text-xs text-white/30">
            <Link href={`/?rec=${m.id}#recommended`} scroll={false} className="transition hover:text-white/70">
              More like this →
            </Link>
          </p>
        </div>
      ))}
    </div>
  );
}
