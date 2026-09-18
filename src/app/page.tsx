import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MoodSection from "@/components/MoodSection";
import Footer from "@/components/Footer";
import SelectableMovieGrid from "@/components/SelectableMovieGrid";
import { GenreFilterBar, ActiveFiltersSummary } from "@/components/SearchFilters";
import SortSelect from "@/components/SortSelect";
import RecommendedSection, { RecommendedSkeleton } from "@/components/RecommendedSection";
import {
  getTrendingMovies,
  getGenres,
  getGenreMap,
  searchMovies,
  discoverMovies,
  sortMovies,
  type TMDBMovie,
  type SortOption,
} from "@/lib/tmdb";

import MoodResults from "@/components/MoodResults";
import CustomMoodResults from "@/components/CustomMoodResults";
import IndianMoviesSection from "@/components/IndianMoviesSection";
import AdvancedFilters from "@/components/AdvancedFilters";

export const revalidate = 3600;

type SearchParams = Promise<{ q?: string; genre?: string; sort?: string; rec?: string; mood?: string; customMood?: string; year?: string; rating?: string; language?: string; region?: string; originCountry?: string }>;

function isValidSort(v: string | undefined): v is SortOption {
  return v === "popularity" || v === "rating" || v === "release_date";
}

const VALID_MOODS = ["feelgood", "mindbending", "heartbreak", "adrenaline", "cozy", "dark"];

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const qRaw = params.q ?? "";
  const q = qRaw.trim();
  const hasSearch = q.length > 0;

  const genreParam = params.genre ?? "";
  const genreId = genreParam ? Number(genreParam) : undefined;
  const validGenreId = genreId && !Number.isNaN(genreId) ? genreId : undefined;

  const sortParam = params.sort ?? "popularity";
  const sort: SortOption = isValidSort(sortParam) ? sortParam : "popularity";

  // Phase 5: selected movie for recommendations ( ?rec=123 )
  const recParam = params.rec ?? "";
  const recId = recParam ? Number(recParam) : null;
  const validRecId = recId && !Number.isNaN(recId) ? recId : null;

  // Mood param - ?mood=feelgood etc. Preserve search/filter together
  const moodParam = (params.mood ?? "").toLowerCase();
  const validMood = VALID_MOODS.includes(moodParam) ? moodParam : null;

  // Custom mood text - ?customMood=Something nostalgic and warm (user typed)
  const customMoodRaw = params.customMood ?? "";
  const customMood = customMoodRaw.trim();
  // Prevent empty or too long (100 chars) from triggering request
  const validCustomMood = customMood && customMood.length > 0 && customMood.length <= 100 ? customMood : null;
  // Custom and predefined are independent but mutually exclusive in UI - if custom present, hide predefined results
  const showCustom = !!validCustomMood;
  const showPredefined = !!validMood && !showCustom;

  // Extended filters - year, rating, language, region, originCountry (for Indian cinema etc.)
  const yearParam = params.year ?? "";
  const validYear = /^\d{4}$/.test(yearParam) ? yearParam : null;
  const ratingParam = params.rating ?? "";
  const validRating = ["6", "7", "8"].includes(ratingParam) ? ratingParam : null;
  const langParam = params.language ?? "";
  const validLang = langParam && /^[a-z]{2}$/.test(langParam) ? langParam : null;
  const regionParam = params.region ?? "";
  const validRegion = regionParam && /^[A-Z]{2}$/.test(regionParam) ? regionParam : null;
  const originParam = params.originCountry ?? "";
  const validOrigin = originParam && /^[A-Z]{2}$/.test(originParam) ? originParam : null;

  // Fetch genres + hero trending in parallel (secure server fetch, key hidden)
  // Use allSettled so one failing API does not hide homepage; dedupe via tmdbFetch cache
  // Also fetch grid movies in parallel with hero where possible to reduce sequential latency
  let genres: { id: number; name: string }[] = [];
  let genreMap = new Map<number, string>();
  let heroMovie: TMDBMovie | null = null;
  let heroTrendingCache: TMDBMovie[] = [];
  let fetchError: string | null = null;

  // Start hero fetches immediately
  const heroPromise = Promise.allSettled([getGenres(), getGenreMap(), getTrendingMovies()]);

  // Start grid fetch in parallel if it doesn't depend on hero result (search/discover)
  // For trending mode, we will reuse heroTrendingCache, so no need for separate fetch yet
  let gridPromise: Promise<{ movies: TMDBMovie[]; error: string | null; mode: string }> | null = null;
  if (hasSearch) {
    gridPromise = (async () => {
      try {
        const searched = await searchMovies(q);
        let filtered = validGenreId ? searched.filter((m) => m.genre_ids.includes(validGenreId)) : searched;
        filtered = sortMovies(filtered, sort);
        return { movies: filtered.slice(0, 12), error: null, mode: "search" };
      } catch (e) {
        return { movies: [], error: e instanceof Error ? e.message : "Search failed", mode: "search" };
      }
    })();
  } else if (validGenreId || sort !== "popularity" || validYear || validRating || validLang || validRegion || validOrigin) {
    gridPromise = (async () => {
      try {
        const res = await discoverMovies({
          genreId: validGenreId,
          sortBy: sort,
          year: validYear || undefined,
          ratingGte: validRating || undefined,
          language: validLang || undefined,
          region: validRegion || undefined,
          originCountry: validOrigin || undefined,
        });
        return { movies: res.slice(0, 12), error: null, mode: "discover" };
      } catch (e) {
        return { movies: [], error: e instanceof Error ? e.message : "Discover failed", mode: "discover" };
      }
    })();
  }

  const [gRes, gmRes, tRes] = await heroPromise;
  if (gRes.status === "fulfilled") genres = gRes.value;
  else console.warn("[Home] getGenres failed:", String(gRes.reason).slice(0, 150));
  if (gmRes.status === "fulfilled") genreMap = gmRes.value;
  else console.warn("[Home] getGenreMap failed:", String(gmRes.reason).slice(0, 150));
  if (tRes.status === "fulfilled" && tRes.value.length > 0) {
    heroTrendingCache = tRes.value;
    heroMovie = tRes.value[0] ?? null;
  } else {
    console.warn("[Home] getTrendingMovies failed:", tRes.status === "rejected" ? String(tRes.reason).slice(0, 150) : "empty");
    // Fallback to popular so hero never empty
    try {
      const { getPopularMovies } = await import("@/lib/tmdb");
      const popular = await getPopularMovies();
      heroMovie = popular[0] ?? null;
      heroTrendingCache = popular;
    } catch {}
    if (!heroMovie) fetchError = tRes.status === "rejected" ? String(tRes.reason).slice(0, 200) : "No trending movies";
  }

  // Build genre record for MovieGrid
  const genreRecord: Record<number, string> = {};
  for (const [k, v] of genreMap) genreRecord[k] = v;

  // Main grid: decide fetch based on query params (search + filters work together)
  // If gridPromise was started in parallel (search/discover), await it now to overlap with hero fetch
  let movies: TMDBMovie[] = [];
  let gridError: string | null = fetchError;
  let mode: string = "trending";

  if (fetchError) {
    movies = [];
  } else if (gridPromise) {
    // Search/discover was already started in parallel with hero - just await
    const res = await gridPromise;
    movies = res.movies;
    gridError = res.error;
    mode = res.mode as typeof mode;
  } else {
    mode = "trending";
    // Reuse heroTrendingCache to avoid duplicate fetch (optimization)
    if (heroTrendingCache.length > 0) {
      movies = heroTrendingCache.slice(0, 12);
    } else {
      try {
        const trending = await getTrendingMovies();
        if (trending.length > 0) movies = trending.slice(0, 12);
        else throw new Error("Empty trending");
      } catch (e) {
        console.warn("[Home] trending failed, trying popular:", String(e).slice(0, 150));
        try {
          const { getPopularMovies } = await import("@/lib/tmdb");
          const popular = await getPopularMovies();
          if (popular.length > 0) {
            movies = popular.slice(0, 12);
            gridError = null; // fallback succeeded, clear error
          } else {
            gridError = e instanceof Error ? e.message : "Trending failed";
          }
        } catch {
          gridError = e instanceof Error ? e.message : "Trending failed";
        }
      }
    }
    // Ensure homepage never shows 0 due to transient fetch - if still empty, keep gridError but MoodResults will still show separate
    if (movies.length === 0 && !gridError) {
      gridError = "No movies available - please retry";
    }
  }

  const genreName = validGenreId ? genres.find((g) => g.id === validGenreId)?.name : null;

  const emptyMessage =
    hasSearch && validGenreId
      ? `No results for "${q}" in ${genreName ?? "this genre"} with ${sort} sort. Try clearing filters.`
      : hasSearch
        ? `No results for "${q}". Try another spelling or clear search.`
        : validGenreId
          ? `No movies found for ${genreName ?? "this genre"} with ${sort} sort. Try another filter.`
          : undefined;

  const subtitle =
    mode === "search"
      ? `Search results for "${q}" • ${movies.length} found • Sorted by ${sort}`
      : mode === "discover"
        ? `Filtered by ${genreName ?? "all genres"} • Sorted by ${sort} • Live from TMDB`
        : `Trending today • Updates hourly • Server-side fetch`;

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Suspense fallback={<div className="h-[68px] border-b border-white/[0.06] bg-[#060610]/70" />}>
        <Navbar />
      </Suspense>
      <main>
        <Hero movie={heroMovie} />

        {/* Search + Filters Section - Phase 4 */}
        <section id="trending" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {hasSearch ? "Search Results" : validGenreId || sort !== "popularity" ? "Discover" : "Trending Now"}
              </h2>
              <p className="mt-1.5 text-sm text-white/50">{gridError ? "Unable to load" : subtitle}</p>
            </div>
            <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-full bg-white/10" />}>
              <SortSelect />
            </Suspense>
          </div>

          {/* Genre filters from TMDB (dynamic) */}
          <div className="mt-6">
            <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-full bg-white/5" />}>
              <GenreFilterBar genres={genres} />
            </Suspense>
          </div>

          <div className="mt-4">
            <Suspense fallback={null}>
              <ActiveFiltersSummary genres={genres} />
            </Suspense>
          </div>

          {gridError ? (
            <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load movies</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/60">
                {gridError.includes("TMDB_API_KEY") ? (
                  <>
                    Check <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code> has{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5">TMDB_API_KEY</code> (never use NEXT_PUBLIC_)
                  </>
                ) : (
                  gridError
                )}
              </p>
              <p className="mt-2 text-xs text-white/30">Empty search is handled gracefully - just clear the input to see trending.</p>
            </div>
          ) : (
            <Suspense fallback={<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-[360px] animate-pulse rounded-[20px] bg-white/5"/> )}</div>}>
              <SelectableMovieGrid movies={movies} genreMap={genreRecord} emptyMessage={emptyMessage} />
            </Suspense>
          )}

          {/* Advanced filters - Year, Rating, Language */}
          <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-white/[0.02]" />}>
            <AdvancedFilters />
          </Suspense>

          {/* Stats - keep premium look */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:gap-6 sm:p-5">
            <div className="text-center sm:text-left">
              <p className="text-xl font-bold sm:text-2xl">{movies.length || "—"}</p>
              <p className="text-xs text-white/40">{mode === "search" ? "Search results" : mode === "discover" ? "Filtered titles" : "Live TMDB titles"}</p>
            </div>
            <div className="text-center border-x border-white/5 sm:text-left sm:pl-6">
              <p className="text-xl font-bold sm:text-2xl">Secure</p>
              <p className="text-xs text-white/40">Key hidden on server</p>
            </div>
            <div className="text-center sm:text-left sm:pl-6">
              <p className="text-xl font-bold sm:text-2xl">{hasSearch ? `"${q.slice(0, 12)}"` : genreName ?? "All"}</p>
              <p className="text-xs text-white/40">Active filter</p>
            </div>
          </div>
        </section>

        {/* Indian Cinema - real TMDB data with region/originCountry/language */}
        <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-10"><div className="h-64 animate-pulse rounded-[28px] bg-white/[0.02]" /></div>}>
          <IndianMoviesSection />
        </Suspense>

        {/* Phase 5: Recommended For You - uses TMDB recommendations/similar, not AI */}
        <Suspense fallback={<RecommendedSkeleton />}>
          <RecommendedSection
            selectedId={validRecId}
            selectedTitle={validRecId ? movies.find((m) => m.id === validRecId)?.title ?? heroMovie?.title ?? null : null}
            genreMap={genreRecord}
            fallbackMovies={movies.length ? movies : heroMovie ? [heroMovie] : []}
          />
        </Suspense>

        <Suspense fallback={<div className="h-[62px] border-b border-white/[0.06] bg-[#060610]/70" />}>
          <MoodSection />
        </Suspense>

        {/* Mood results - predefined */}
        {showPredefined && (
          <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-6"><div className="h-32 animate-pulse rounded-2xl bg-white/5" /></div>}>
            <MoodResults mood={validMood!} genreMap={genreRecord} />
          </Suspense>
        )}

        {/* Custom mood results - typed text */}
        {showCustom && (
          <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-6"><div className="h-32 animate-pulse rounded-2xl bg-white/5" /></div>}>
            <CustomMoodResults text={validCustomMood!} genreMap={genreRecord} />
          </Suspense>
        )}

        <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#ec4899] via-[#8b5cf6] to-[#3b82f6] p-[1px]">
            <div className="rounded-[27px] bg-gradient-to-br from-[#1a0b1e] to-[#0f0f2a] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:p-10">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Never miss a premiere</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">Get weekly trending picks and mood-based recommendations. No spam. Preview form — wire it to your backend later.</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
                <input
                  placeholder="Your email"
                  type="email"
                  className="h-11 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 sm:w-[280px]"
                />
                <button type="button" className="h-11 rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
