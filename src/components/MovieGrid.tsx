import MovieCard from "@/components/MovieCard";
import type { TMDBMovie } from "@/lib/tmdb";

export function MovieGrid({
  movies,
  genreMap,
  emptyMessage,
}: {
  movies: TMDBMovie[];
  genreMap: Record<number, string>;
  emptyMessage?: string;
}) {
  const getGenreName = (ids: number[]) => {
    if (!ids?.length) return "Trending";
    return genreMap[ids[0]] ?? "Trending";
  };

  if (movies.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">🎬</div>
        <h3 className="mt-4 text-sm font-semibold text-white">No movies found</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
          {emptyMessage ?? "Try a different search, genre or sort option."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {movies.map((movie, idx) => (
        <MovieCard key={movie.id} movie={movie} genreName={getGenreName(movie.genre_ids)} index={idx} />
      ))}
    </div>
  );
}

export function MovieGridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0f0f1e]">
          <div className="aspect-[3/4] animate-pulse bg-white/[0.06]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
