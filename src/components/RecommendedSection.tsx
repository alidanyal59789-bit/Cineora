import Link from "next/link";
import RecGrid from "@/components/RecGrid";
import { getRecommendedMovies, getPopularMovies, type TMDBMovie } from "@/lib/tmdb";

type Props = {
  selectedId: number | null;
  selectedTitle?: string | null;
  genreMap: Record<number, string>;
  fallbackMovies?: TMDBMovie[]; // for default when no selection
};

// Server component - fetches securely on server, never exposes API key
export default async function RecommendedSection({ selectedId, selectedTitle, genreMap, fallbackMovies }: Props) {
  let movies: TMDBMovie[] = [];
  let source: "recommendations" | "similar" | "trending" | "popular" | "none" = "none";
  let error: string | null = null;
  let title = "Recommended For You";
  let subtitle = "Personalized picks - powered by TMDB related-movie data (not AI)";

  try {
    if (selectedId) {
      const res = await getRecommendedMovies(selectedId);
      movies = res.movies;
      source = res.source;
      if (movies.length > 0) {
        title = `Because you picked "${selectedTitle ?? `#${selectedId}`}"`;
        subtitle =
          source === "recommendations"
            ? "TMDB recommendations - audience also liked these • Not personalized AI"
            : source === "similar"
              ? "Similar movies by genre & story • TMDB similar endpoint • Not AI"
              : subtitle;
      } else {
        // fallback to popular if no recommendations
        const popular = await getPopularMovies();
        movies = popular.slice(0, 8);
        source = "popular";
        title = `More like "${selectedTitle ?? `#${selectedId}`}" - popular picks`;
        subtitle = "No direct recommendations found, showing popular titles • TMDB data";
      }
    } else if (fallbackMovies && fallbackMovies.length > 0) {
      // Default: show recommendations for first fallback movie (trending #1) or just trending
      const firstId = fallbackMovies[0]?.id;
      if (firstId) {
        const res = await getRecommendedMovies(firstId);
        if (res.movies.length > 0) {
          movies = res.movies;
          source = res.source;
          title = `Recommended For You`;
          subtitle =
            source === "recommendations"
              ? `Based on "${fallbackMovies[0].title}" (trending #1) • TMDB recommendations • Not AI`
              : `Similar to "${fallbackMovies[0].title}" • TMDB similar • Not AI`;
        } else {
          movies = fallbackMovies.slice(1, 9);
          source = "trending";
          subtitle = "Trending now as default picks • TMDB data • Not personalized";
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load recommendations";
  }

  // Empty state
  if (error) {
    return (
      <section id="recommended" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load recommendations</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/60">{error}</p>
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return (
      <section id="recommended" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">✨</div>
          <h3 className="mt-4 text-sm font-semibold text-white">No recommendations yet</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
            Try clicking any movie poster to see related titles. Recommendations use TMDB&apos;s related-movie data.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="recommended" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
        <div className="rounded-[27px] bg-[#0c0c1a] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#f9a8d4]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ec4899]" />
                TMDB RELATED • NOT AI
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
              <p className="mt-1.5 max-w-[60ch] text-sm leading-6 text-white/50">{subtitle}</p>
            </div>
            {selectedId && (
              <Link
                href="/#recommended"
                scroll={false}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
              >
                Clear selection
                <span className="text-[11px]">✕</span>
              </Link>
            )}
          </div>

          <RecGrid movies={movies} genreMap={genreMap} />

          <p className="mt-6 text-center text-xs text-white/25">
            Tip: Use &ldquo;More like this&rdquo; under any poster to refresh recommendations for that movie. Uses <code className="rounded bg-white/10 px-1.5 py-0.5">/movie/{"{id}"}/recommendations</code> then fallback to{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">/similar</code> • All fetches server-side, key hidden.
          </p>
        </div>
      </div>
    </section>
  );
}

// Skeleton for Suspense
export function RecommendedSkeleton() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
        <div className="h-6 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-white/5" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0f0f1e]">
              <div className="aspect-[3/4] animate-pulse bg-white/[0.06]" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
