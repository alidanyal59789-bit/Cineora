// Server-only TMDB helper - API key never leaves the server
// Uses Node fetch() with async/await. Do not add "NEXT_PUBLIC_" to the key.

export type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
};

type TMDBListResponse = {
  results: TMDBMovie[];
};

type Genre = { id: number; name: string };

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

// Helper to build secure URL. Supports both v3 api_key and v4 Bearer token.
function getAuth() {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  // v4 tokens are JWT (start with eyJ and very long)
  const isBearer = key.startsWith("eyJ") && key.length > 100;
  return { key, isBearer };
}

async function tmdbFetch(path: string, retries = 1): Promise<unknown> {
  const auth = getAuth();
  if (!auth) {
    throw new Error("TMDB_API_KEY missing in .env.local");
  }

  const url = auth.isBearer
    ? `${BASE_URL}${path}`
    : `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${auth.key}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth.isBearer) {
    headers.Authorization = `Bearer ${auth.key}`;
  }

  // Helper: fallback via Node https (more stable than undici fetch in this env)
  const fetchViaHttps = (): Promise<unknown> =>
    new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const https = require("https") as typeof import("https");
      const req = https.get(
        url,
        { headers },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`TMDB ${path} failed: HTTP ${res.statusCode} ${data.slice(0, 200)}`));
            } else {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`TMDB ${path} invalid JSON: ${String(e).slice(0, 100)}`));
              }
            }
          });
        }
      );
      req.on("error", (err) => reject(new Error(`TMDB ${path} network failed: ${err.message} code:${(err as NodeJS.ErrnoException).code || "unknown"}`)));
      req.setTimeout(6000, () => {
        req.destroy(new Error(`TMDB ${path} timeout after 6s`));
      });
    });

  const doFetch = async (): Promise<unknown> => {
    // AbortController with 8s timeout - avoids hanging forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const isAuth = res.status === 401 || res.status === 403;
        const isRateLimit = res.status === 429;
        const hint = isAuth ? " (check TMDB_API_KEY)" : isRateLimit ? " (rate limited)" : "";
        throw new Error(`TMDB ${path} failed: HTTP ${res.status}${hint} ${text.slice(0, 200)}`);
      }
      const data = (await res.json()) as unknown;
      return data;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  };

  const isNetworkError = (msg: string) =>
    msg.includes("fetch failed") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("network failed") ||
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    msg.includes("UND_ERR");
  const isHttpError = (msg: string) =>
    msg.includes("HTTP 401") || msg.includes("HTTP 403") || msg.includes("HTTP 429") || msg.includes("HTTP 404");

  // Attempt 1: direct fetch. No recursive tmdbFetch to avoid dedupe deadlock.
  try {
    return await doFetch();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // HTTP errors (401/403/404/429) are permanent - never retry, surface immediately
    if (isHttpError(msg) || msg.includes("HTTP 4")) {
      if (msg.includes("HTTP 401") || msg.includes("HTTP 403") || msg.includes("HTTP 429")) {
        console.error(`[TMDB] HTTP error for ${path} - ${msg.slice(0, 200)}`);
      }
      throw e;
    }
    // Only retry once for temporary network failures
    if (isNetworkError(msg) && retries > 0) {
      console.warn(`[TMDB] network retry for ${path} - ${msg.slice(0, 100)}`);
      await new Promise((r) => setTimeout(r, 400));
      try {
        return await doFetch();
      } catch {
        console.warn(`[TMDB] retry failed, https fallback for ${path}`);
        return await fetchViaHttps();
      }
    }
    if (isNetworkError(msg)) {
      console.warn(`[TMDB] network error, https fallback for ${path}`);
      return await fetchViaHttps();
    }
    throw e;
  }
}

export async function getTrendingMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch("/trending/movie/day?language=en-US")) as TMDBListResponse;
  return data.results ?? [];
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch("/movie/popular?language=en-US&page=1")) as TMDBListResponse;
  return data.results ?? [];
}

export async function getTopRatedMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch("/movie/top_rated?language=en-US&page=1")) as TMDBListResponse;
  return data.results ?? [];
}

export async function getUpcomingMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch("/movie/upcoming?language=en-US&page=1")) as TMDBListResponse;
  return data.results ?? [];
}

export async function getNowPlayingMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch("/movie/now_playing?language=en-US&page=1")) as TMDBListResponse;
  return data.results ?? [];
}

export async function getGenreMap(): Promise<Map<number, string>> {
  try {
    const data = (await tmdbFetch("/genre/movie/list?language=en-US")) as { genres: Genre[] };
    const map = new Map<number, string>();
    for (const g of data.genres ?? []) map.set(g.id, g.name);
    return map;
  } catch {
    return new Map();
  }
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const data = (await tmdbFetch("/genre/movie/list?language=en-US")) as { genres: Genre[] };
    return data.genres ?? [];
  } catch {
    return [];
  }
}

// --- Phase 4: Search + Discover ---

export type SortOption = "popularity" | "rating" | "release_date";

export function mapSortToTMDB(sort: SortOption): string {
  switch (sort) {
    case "rating":
      return "vote_average.desc";
    case "release_date":
      return "primary_release_date.desc";
    case "popularity":
    default:
      return "popularity.desc";
  }
}

/**
 * Search movies by text query. Uses TMDB /search/movie.
 * Empty/whitespace query returns [] (no API call) - prevents error.
 */
export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const q = query.trim();
  if (!q) return [];
  // encodeURIComponent handles spaces/special chars safely
  const encoded = encodeURIComponent(q);
  const data = (await tmdbFetch(`/search/movie?query=${encoded}&language=en-US&page=1&include_adult=false`)) as TMDBListResponse;
  // Filter out results without poster/title for cleaner UI, but keep fallback if needed
  return (data.results ?? []).filter((m) => !!m.title);
}

/**
 * Discover movies by genre + sort. Uses TMDB /discover/movie.
 * Supports with_genres and sort_by query params.
 * Extended for Indian cinema, year, rating, language.
 */
export async function discoverMovies(opts: {
  genreId?: number;
  sortBy?: SortOption;
  year?: string;
  ratingGte?: string;
  language?: string;
  originCountry?: string;
  region?: string;
  withOriginalLanguage?: string;
} = {}): Promise<TMDBMovie[]> {
  const params = new URLSearchParams();
  params.set("language", "en-US");
  params.set("page", "1");
  params.set("sort_by", mapSortToTMDB(opts.sortBy ?? "popularity"));
  // TMDB needs vote_count filter for rating sort to avoid obscure 10/10 with 1 vote
  if (opts.sortBy === "rating") {
    params.set("vote_count.gte", "100");
  }
  if (opts.genreId) {
    params.set("with_genres", String(opts.genreId));
  }
  if (opts.year) {
    params.set("primary_release_year", opts.year);
  }
  if (opts.ratingGte) {
    params.set("vote_average.gte", opts.ratingGte);
  }
  if (opts.language) {
    params.set("with_original_language", opts.language);
  }
  if (opts.originCountry) {
    params.set("with_origin_country", opts.originCountry);
  }
  if (opts.region) {
    params.set("region", opts.region);
  }
  if (opts.withOriginalLanguage) {
    params.set("with_original_language", opts.withOriginalLanguage);
  }
  // Include only movies with posters? Keep all for fallback gradient
  const data = (await tmdbFetch(`/discover/movie?${params.toString()}`)) as TMDBListResponse;
  return data.results ?? [];
}

// Indian cinema helpers - real TMDB data, no fakes
export async function getIndianMovies(): Promise<TMDBMovie[]> {
  // Indian-produced movies (origin country IN) - not just Hindi, all languages
  const data = (await tmdbFetch(`/discover/movie?language=en-US&page=1&sort_by=popularity.desc&with_origin_country=IN&region=IN`)) as TMDBListResponse;
  return (data.results ?? []).slice(0, 12);
}

export async function getHindiMovies(): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch(`/discover/movie?language=en-US&page=1&sort_by=popularity.desc&with_origin_country=IN&with_original_language=hi`)) as TMDBListResponse;
  return (data.results ?? []).slice(0, 12);
}

/**
 * Client-side sorting helper for search results (where TMDB search doesn't support sort_by).
 * Keeps logic in one place so server and client sort identically.
 */
export function sortMovies(movies: TMDBMovie[], sortBy: SortOption): TMDBMovie[] {
  const copy = [...movies];
  switch (sortBy) {
    case "rating":
      return copy.sort((a, b) => b.vote_average - a.vote_average);
    case "release_date":
      return copy.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    case "popularity":
    default:
      // TMDB search returns by relevance/popularity already, keep as-is for popularity
      // For consistency, we sort by vote_average*? No, keep original order.
      return copy;
  }
}

// --- Phase 5: Recommendations & Details ---

export type TMDBMovieDetails = TMDBMovie & {
  backdrop_path: string | null;
  poster_path: string | null;
  runtime: number | null;
  genres: Genre[];
  tagline: string | null;
  status: string;
  vote_count: number;
};

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  const data = (await tmdbFetch(`/movie/${id}?language=en-US`)) as TMDBMovieDetails;
  return data;
}

/**
 * TMDB /movie/{id}/recommendations - movies TMDB thinks audience liked together.
 * /similar returns movies with similar genre/plot. We try recommendations first, fallback to similar.
 */
export async function getRecommendations(movieId: number): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch(`/movie/${movieId}/recommendations?language=en-US&page=1`)) as TMDBListResponse;
  return data.results ?? [];
}

export async function getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
  const data = (await tmdbFetch(`/movie/${movieId}/similar?language=en-US&page=1`)) as TMDBListResponse;
  return data.results ?? [];
}

/** Unified helper: try recommendations, then similar, return whichever has data */
export async function getRecommendedMovies(movieId: number): Promise<{ movies: TMDBMovie[]; source: "recommendations" | "similar" | "none" }> {
  try {
    const rec = await getRecommendations(movieId);
    if (rec.length > 0) return { movies: rec.slice(0, 12), source: "recommendations" };
  } catch {
    // ignore and try similar
  }
  try {
    const sim = await getSimilarMovies(movieId);
    if (sim.length > 0) return { movies: sim.slice(0, 12), source: "similar" };
  } catch {
    // ignore
  }
  return { movies: [], source: "none" };
}

export type TMDBVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
};

export async function getMovieVideos(movieId: number, language: string = "en-US"): Promise<TMDBVideo[]> {
  // Try with language first (e.g. en-US), fallback to no language / all if empty or network fails
  const tryFetch = async (lang?: string): Promise<TMDBVideo[]> => {
    const path = lang ? `/movie/${movieId}/videos?language=${lang}` : `/movie/${movieId}/videos`;
    try {
      const data = (await tmdbFetch(path)) as { results: TMDBVideo[] };
      return data.results ?? [];
    } catch (e) {
      // Distinguish network vs empty - log without key, rethrow for caller to handle
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("HTTP 4")) throw e; // Don't fallback on 404/401, it's real empty or auth error
      console.warn(`[Videos] fetch failed for ${movieId} lang=${lang ?? "all"}: ${msg.slice(0,120)}`);
      throw e;
    }
  };

  // First try requested language (default en-US)
  try {
    const primary = await tryFetch(language);
    if (primary.length > 0) return primary;
  } catch {
    // Network error - try fallback before giving up
    console.warn(`[Videos] primary lang ${language} failed for ${movieId}, trying fallback`);
  }

  if (language !== "en-US") {
    try {
      const fallbackEn = await tryFetch("en-US");
      if (fallbackEn.length > 0) return fallbackEn;
    } catch {}
  }
  // Final fallback: no language filter (returns all languages)
  if (language) {
    try {
      const all = await tryFetch(undefined);
      if (all.length > 0) return all;
      return all; // empty is valid - means TMDB has no videos in any language
    } catch (e) {
      // If all fallbacks fail due to network, throw to let caller show network error vs empty
      throw e;
    }
  }
  return [];
}

/** Find best YouTube trailer: prioritize official Trailer, then any Trailer, then Teaser */
export function findTrailer(videos: TMDBVideo[]): TMDBVideo | null {
  if (!videos.length) return null;
  const youtube = videos.filter((v) => v.site === "YouTube");
  if (!youtube.length) return null;
  const officialTrailer = youtube.find((v) => v.type === "Trailer" && v.official);
  if (officialTrailer) return officialTrailer;
  const anyTrailer = youtube.find((v) => v.type === "Trailer");
  if (anyTrailer) return anyTrailer;
  const teaser = youtube.find((v) => v.type === "Teaser");
  if (teaser) return teaser;
  return youtube[0];
}

// Mood -> TMDB genre mapping (valid TMDB IDs: https://api.themoviedb.org/3/genre/movie/list)
export const MOOD_GENRE_MAP: Record<string, number[]> = {
  feelgood: [35, 10751], // Comedy, Family
  mindbending: [9648, 878], // Mystery, Science Fiction
  heartbreak: [18, 10749], // Drama, Romance
  adrenaline: [28, 53], // Action, Thriller
  cozy: [10751, 35, 16], // Family, Comedy, Animation
  dark: [80, 53, 27], // Crime, Thriller, Horror
  // Also support example labels for generic use
  happy: [35, 10751],
  excited: [28, 12],
  romantic: [10749],
  thoughtful: [18, 9648],
  scared: [27, 53],
};

export async function getMoodMovies(moodId: string): Promise<TMDBMovie[]> {
  const genreIds = MOOD_GENRE_MAP[moodId.toLowerCase()];
  if (!genreIds || genreIds.length === 0) return [];
  // Reuse working discoverMovies (single genre) which is known to succeed.
  // For OR logic (Drama OR Romance), fetch each genre separately and merge.
  try {
    const settled = await Promise.allSettled(genreIds.map((gid) => discoverMovies({ genreId: gid })));
    const all: TMDBMovie[] = [];
    let anySuccess = false;
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) {
        anySuccess = true;
        all.push(...r.value);
      } else if (r.status === "rejected") {
        console.error(`[Mood] discover failed for genre ${genreIds}:`, String(r.reason).slice(0, 200));
      }
    }
    // Deduplicate by id
    const map = new Map<number, TMDBMovie>();
    for (const m of all) if (!map.has(m.id)) map.set(m.id, m);
    const deduped = Array.from(map.values());
    deduped.sort((a, b) => b.vote_average - a.vote_average);
    const sliced = deduped.slice(0, 12);
    if (sliced.length > 0) return sliced;
    if (anySuccess) return deduped.slice(0, 12);
    // If all discovers failed (network), fallback to trending/popular which are known to be cached and stable
    console.warn(`[Mood] all genre discovers failed for ${moodId}, falling back to trending`);
    try {
      const trending = await getTrendingMovies();
      if (trending.length > 0) return trending.slice(0, 12);
    } catch {}
    try {
      const popular = await getPopularMovies();
      if (popular.length > 0) return popular.slice(0, 12);
    } catch {}
    return [];
  } catch (e) {
    console.error(`[Mood] fetch failed for ${moodId}:`, e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200));
    // Final fallback - try trending so UI shows movies instead of error
    try {
      const trending = await getTrendingMovies();
      if (trending.length > 0) return trending.slice(0, 12);
    } catch {}
    throw e;
  }
}

// Custom mood text -> genre mapping (simple keyword matching, not AI)
// Hinglish: user jo likhta hai usme se keywords nikal ke genre IDs banate hain
export function parseCustomMoodText(text: string): { genreIds: number[]; matchedKeywords: string[] } {
  const lower = text.toLowerCase();
  const genreSet = new Set<number>();
  const matched: string[] = [];

  const add = (keywords: string[], genreId: number) => {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        genreSet.add(genreId);
        if (!matched.includes(kw)) matched.push(kw);
      }
    }
  };

  // Comedy / funny
  add(["funny", "comedy", "laugh", "hilarious", "humor", "humour", "comical"], 35);
  // Family / warm / cozy / nostalgic
  add(["family", "warm", "nostalgic", "nostalgia", "cozy", "cozy night", "feel-good", "feel good", "uplifting", "heartwarming", "wholesome", "comfort"], 10751);
  // Romance / emotional
  add(["romantic", "romance", "love", "emotional", "cry", "tear", "heartbreak", "heart break", "relationship"], 10749);
  // Drama
  add(["drama", "dramatic", "emotional", "thoughtful", "deep", "moving", "touching"], 18);
  // Action / excited
  add(["action", "excited", "excitement", "adrenaline", "thrill", "fast", "energetic", "epic"], 28);
  // Adventure
  add(["adventure", "journey", "explore", "quest"], 12);
  // Horror / scared / dark
  add(["horror", "scared", "scary", "fear", "creepy", "dark", "gloomy", "spooky", "haunted"], 27);
  // Thriller / psychological
  add(["thriller", "thrilling", "psychological", "suspense", "tense", "edge"], 53);
  // Mystery
  add(["mystery", "mysterious", "mind-bending", "mind bending", "twist", "puzzle", "detective"], 9648);
  // Sci-Fi
  add(["sci-fi", "scifi", "science fiction", "space", "future", "sci fi", "alien", "robot"], 878);
  // Animation
  add(["animation", "animated", "cartoon", "anime"], 16);
  // Crime / dark gritty
  add(["crime", "gangster", "noir", "gritty", "mafia"], 80);
  // Fantasy
  add(["fantasy", "magical", "magic", "wizard", "dragon"], 14);
  // Music
  add(["music", "musical", "song", "concert"], 10402);
  // War / history
  add(["war", "battle", "soldier", "history", "historical"], 10752);
  // Western
  add(["western", "cowboy"], 37);

  let genreIds = Array.from(genreSet);
  // If no keyword matched, fallback to broad feel-good + drama (approximate match)
  if (genreIds.length === 0) {
    // Use Drama + Comedy as safe default for ambiguous text
    genreIds = [18, 35];
  }
  // Limit to 3 genres max to avoid too broad query
  genreIds = genreIds.slice(0, 3);
  return { genreIds, matchedKeywords: matched };
}

export async function getCustomMoodMovies(text: string): Promise<{ movies: TMDBMovie[]; genreIds: number[]; matchedKeywords: string[]; isApproximate: boolean }> {
  const trimmed = text.trim();
  if (!trimmed) return { movies: [], genreIds: [], matchedKeywords: [], isApproximate: false };
  const { genreIds, matchedKeywords } = parseCustomMoodText(trimmed);
  const isApproximate = matchedKeywords.length === 0 || matchedKeywords.length < 2;
  // Reuse same OR logic as getMoodMovies
  try {
    const settled = await Promise.allSettled(genreIds.map((gid) => discoverMovies({ genreId: gid })));
    const all: TMDBMovie[] = [];
    let anySuccess = false;
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) {
        anySuccess = true;
        all.push(...r.value);
      }
    }
    const map = new Map<number, TMDBMovie>();
    for (const m of all) if (!map.has(m.id)) map.set(m.id, m);
    const deduped = Array.from(map.values());
    deduped.sort((a, b) => b.vote_average - a.vote_average);
    const sliced = deduped.slice(0, 12);
    if (sliced.length > 0) return { movies: sliced, genreIds, matchedKeywords, isApproximate };
    if (anySuccess) return { movies: deduped.slice(0, 12), genreIds, matchedKeywords, isApproximate };
    // Fallback to trending
    const trending = await getTrendingMovies();
    return { movies: trending.slice(0, 12), genreIds, matchedKeywords, isApproximate: true };
  } catch (e) {
    console.error(`[CustomMood] fetch failed for "${trimmed.slice(0, 50)}":`, e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200));
    try {
      const trending = await getTrendingMovies();
      return { movies: trending.slice(0, 12), genreIds, matchedKeywords, isApproximate: true };
    } catch {}
    return { movies: [], genreIds, matchedKeywords, isApproximate };
  }
}

// Watch Providers types - TMDB /movie/{id}/watch/providers
export type WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type WatchProvidersResult = {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProvidersResult>;
};

export async function getWatchProviders(movieId: number): Promise<WatchProvidersResponse> {
  const data = (await tmdbFetch(`/movie/${movieId}/watch/providers`)) as WatchProvidersResponse;
  return data;
}

// Image helpers - TMDB stores only path, we prepend base.
export function posterUrl(path: string | null, size: "w500" | "w780" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: "w1280" | "original" = "w1280"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function providerLogoUrl(path: string | null, size: string = "w92"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}
