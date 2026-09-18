import Link from "next/link";
import { getCustomMoodMovies } from "@/lib/tmdb";
import MoodMovieGrid from "@/components/MoodMovieGrid";

export default async function CustomMoodResults({
  text,
  genreMap,
}: {
  text: string;
  genreMap: Record<number, string>;
}) {
  const trimmed = text.trim();
  // Prevent empty input from triggering request - handled by caller, but double check
  if (!trimmed) {
    return null;
  }

  let result: Awaited<ReturnType<typeof getCustomMoodMovies>> | null = null;
  let error: string | null = null;

  try {
    result = await getCustomMoodMovies(trimmed);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load custom mood movies";
  }

  const displayText = trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed;
  const movies = result?.movies ?? [];
  const genreIds = result?.genreIds ?? [];
  const matched = result?.matchedKeywords ?? [];
  const isApproximate = result?.isApproximate ?? false;

  return (
    <section id="mood-results" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
        <div className="rounded-[27px] bg-[#0c0c1a] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#f9a8d4]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ec4899]" />
                CUSTOM MOOD • APPROXIMATE MATCH
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Picks for &quot;{displayText}&quot;
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-sm leading-6 text-white/50">
                {matched.length > 0 ? `Matched: ${matched.join(", ")}` : "No direct keyword match"} • Genres {genreIds.join(", ") || "18,35"} • {movies.length} movies •{" "}
                {isApproximate ? "Approximate mood match, not AI understanding" : "Genre-based match"} • TMDB discover
              </p>
              {isApproximate && (
                <p className="mt-1 text-xs text-white/30">This is an approximate genre-based match, not AI understanding. Try different words for better results.</p>
              )}
            </div>
            <Link
              href="/#discover"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Clear ✕
            </Link>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load custom mood movies</h3>
              <p className="mt-2 text-sm text-white/60">{error}</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">🎭</div>
              <h3 className="mt-4 text-sm font-semibold text-white">No results for &quot;{displayText}&quot;</h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
                Try different keywords like funny, romantic, dark, cozy, or pick a mood card above.
              </p>
            </div>
          ) : (
            <>
              <MoodMovieGrid movies={movies} genreMap={genreMap} />
              <p className="mt-6 text-center text-xs text-white/25">
                Custom mood uses keyword mapping to TMDB genres • Server-side fetch • Try &quot;A funny movie for tonight&quot; or &quot;Dark psychological thrillers&quot;
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
