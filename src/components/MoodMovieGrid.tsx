import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

export default function MoodMovieGrid({
  movies,
  genreMap,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
}) {
  const getGenreName = (ids: number[]) => genreMap[ids[0]] ?? "Trending";

  // Poster links to /movie/[id] natively inside MovieCard (works on touch + mouse).
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {movies.map((m, idx) => (
        <div key={m.id} className="group relative">
          <MovieCard movie={m} genreName={getGenreName(m.genre_ids)} index={idx} />
        </div>
      ))}
    </div>
  );
}
