import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MoodMovieGrid from "@/components/MoodMovieGrid";
import DetailsTrailer from "@/components/DetailsTrailer";
import WatchProviders from "@/components/WatchProviders";
import CastCrew from "@/components/CastCrew";
import AddToCollectionButton from "@/components/AddToCollectionButton";
import { getMovieDetails, getRecommendedMovies, getGenreMap, posterUrl, backdropUrl, getMovieVideos, findTrailer, getWatchProviders, getMovieCredits } from "@/lib/tmdb";

export const revalidate = 3600;

type Params = Promise<{ id: string }>;

export default async function MovieDetails({ params }: { params: Params }) {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId) || movieId <= 0) {
    notFound();
  }

  let details: Awaited<ReturnType<typeof getMovieDetails>> | null = null;
  let genreMap = new Map<number, string>();
  let recMovies: Awaited<ReturnType<typeof getRecommendedMovies>>["movies"] = [];
  let recSource: string = "none";
  let trailerKey: string | null = null;
  let trailerName: string | null = null;
  let trailerError: string | null = null;
  let watchProvidersInitial: Awaited<ReturnType<typeof getWatchProviders>>["results"][string] | null = null;
  let watchLink: string | null = null;
  let watchError: string | null = null;
  let credits: Awaited<ReturnType<typeof getMovieCredits>> | null = null;
  let creditsError: string | null = null;
  let error: string | null = null;

  try {
    // Core details first - must succeed quickly, otherwise show error (never blank)
    // Short 9s timeout: tmdbFetch already has 8s abort + 1 retry, so 9s is enough
    const timeout = (ms: number, msg: string) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
    const [dRes, gRes] = await Promise.race([
      Promise.allSettled([getMovieDetails(movieId), getGenreMap()]),
      timeout(9000, "Core fetch timeout after 9s"),
    ] as const).catch((e) => {
      throw e;
    }) as unknown as PromiseSettledResult<unknown>[];

    // Handle details with 404 -> notFound (invalid TMDB ID, e.g. 1520/165489)
    if (dRes.status === "rejected") {
      const msg = String(dRes.reason);
      if (msg.includes("HTTP 404") || msg.includes("status_code\":34") || msg.includes("34,")) notFound();
      throw dRes.reason;
    }
    if (gRes.status === "rejected") console.warn(`[Details] genreMap failed for ${movieId}:`, String(gRes.reason).slice(0,120));

    details = (dRes as PromiseFulfilledResult<Awaited<ReturnType<typeof getMovieDetails>>>).value;
    genreMap = gRes.status === "fulfilled" ? (gRes.value as Map<number, string>) : new Map();

    // Optional sections in parallel - one slow endpoint must not block others
    // Each has its own short timeout; failures become empty/error states, never blank page
    const [recRes, vidRes, provRes, credRes] = await Promise.allSettled([
      Promise.race([getRecommendedMovies(movieId), timeout(8000, "Recommendations timeout")]),
      Promise.race([getMovieVideos(movieId), timeout(8000, "Trailer timeout")]),
      Promise.race([getWatchProviders(movieId), timeout(8000, "Providers timeout")]),
      Promise.race([getMovieCredits(movieId), timeout(8000, "Credits timeout")]),
    ]);

    if (recRes.status === "fulfilled") {
      const rec = recRes.value as Awaited<ReturnType<typeof getRecommendedMovies>>;
      recMovies = rec.movies;
      recSource = rec.source;
    } else {
      console.warn(`[Details] recommendations failed for ${movieId}:`, String(recRes.reason).slice(0,120));
    }

    if (vidRes.status === "fulfilled") {
      const videos = vidRes.value as Awaited<ReturnType<typeof getMovieVideos>>;
      const trailer = findTrailer(videos);
      trailerKey = trailer?.key ?? null;
      trailerName = trailer?.name ?? null;
      if (!trailerKey) console.log(`[Details] no trailer found for ${movieId}, videos count ${videos.length}`);
    } else {
      const msg = String((vidRes as PromiseRejectedResult).reason);
      if (msg.includes("HTTP 404")) {
        console.log(`[Details] no trailer (404) for ${movieId}`);
      } else {
        console.error(`[Details] trailer fetch failed for ${movieId}: ${msg.slice(0,150)}`);
        trailerError = msg.includes("HTTP 401") || msg.includes("HTTP 403") ? "Trailer unavailable (auth)" : msg.includes("timeout") ? "Trailer loading timeout" : "Network error loading trailer";
      }
    }

    if (provRes.status === "fulfilled") {
      const providers = provRes.value as Awaited<ReturnType<typeof getWatchProviders>>;
      const inResult = providers.results?.["IN"] ?? null;
      watchProvidersInitial = inResult;
      watchLink = inResult?.link ?? null;
      if (!inResult) console.log(`[Details] no IN providers for ${movieId}, has US: ${!!providers.results?.["US"]}, total regions: ${Object.keys(providers.results).length}`);
    } else {
      const msg = String((provRes as PromiseRejectedResult).reason);
      if (msg.includes("HTTP 404")) {
        console.log(`[Details] no providers (404) for ${movieId}`);
      } else {
        console.error(`[Details] providers fetch failed for ${movieId}: ${msg.slice(0,150)}`);
        watchError = msg.includes("HTTP 401") || msg.includes("HTTP 403") ? "Providers unavailable (auth)" : msg.includes("timeout") ? "Providers loading timeout" : "Network error loading providers";
      }
    }

    if (credRes.status === "fulfilled") {
      credits = credRes.value as Awaited<ReturnType<typeof getMovieCredits>>;
    } else {
      const msg = String((credRes as PromiseRejectedResult).reason);
      if (!msg.includes("HTTP 404")) {
        console.warn(`[Details] credits failed for ${movieId}:`, msg.slice(0, 150));
        creditsError = msg.includes("HTTP 401") || msg.includes("HTTP 403") ? "Cast & crew unavailable (auth)" : msg.includes("timeout") ? "Cast & crew loading timeout" : "Network error loading cast & crew";
      }
    }
    // Fallback if TMDB has no recommendations/similar for this title (single cheap call only)
    if (recMovies.length === 0 && details) {
      console.warn(`[Details] no recommendations/similar for ${movieId}, falling back to popular`);
      try {
        const { getPopularMovies } = await import("@/lib/tmdb");
        const popular = await Promise.race([getPopularMovies(), timeout(8000, "Fallback timeout")]);
        if (popular.length > 0) {
          recMovies = (popular as Awaited<ReturnType<typeof getPopularMovies>>).slice(0, 8);
          recSource = "popular"; // label as popular/discover fallback
        }
      } catch (fe) {
        console.warn(`[Details] fallback also failed for ${movieId}:`, String(fe).slice(0, 150));
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-[#060610] text-white">
        <Navbar />
        <div className="mx-auto max-w-[1280px] px-4 py-16 text-center">
          <h1 className="text-xl font-bold">Couldn&apos;t load movie</h1>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black">
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const genreRecord: Record<number, string> = {};
  for (const [k, v] of genreMap) genreRecord[k] = v;

  const backdrop = backdropUrl(details.backdrop_path, "w1280");
  const poster = posterUrl(details.poster_path, "w500");

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main>
        {/* Hero details */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#060610]" />
          {backdrop && (
            <Image src={backdrop} alt={details.title} fill className="object-cover opacity-30" priority sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060610] via-[#060610]/70 to-transparent" />
          <div className="relative mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
            <Link href="/#recommended" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              ← Back to recommendations
            </Link>
            <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1e]">
                {poster ? (
                  <Image src={poster} alt={details.title} fill className="object-cover" sizes="300px" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1033] to-[#0f172a] p-6 text-center text-sm text-white/60">
                    No poster
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{details.title}</h1>
                {details.tagline && <p className="mt-2 text-sm italic text-white/50">&quot;{details.tagline}&quot;</p>}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-black">★ {details.vote_average.toFixed(1)}</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/70">
                    {details.release_date?.slice(0, 4) ?? "—"} • {details.runtime ? `${details.runtime} min` : "—"} • {details.status}
                  </span>
                  {details.genres.map((g) => (
                    <span key={g.id} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-white/60">
                      {g.name}
                    </span>
                  ))}
                </div>
                <p className="mt-6 max-w-[60ch] text-sm leading-6 text-white/70">{details.overview || "No overview available."}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#recommendations" className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-6 py-2.5 text-sm font-semibold text-white">
                    Show recommendations
                  </a>
                  <AddToCollectionButton movie={details} variant="details" />
                  <Link href={`/?rec=${details.id}#recommended`} className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white">
                    Show on homepage
                  </Link>
                  <Link href="/" className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white">
                    Home
                  </Link>
                </div>
                <p className="mt-4 text-xs text-white/30">TMDB ID: {details.id} • {details.vote_count} votes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trailer & OTT - premium, responsive */}
        <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trailer */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                <h2 className="text-lg font-bold">Trailer</h2>
                <span className="ml-auto text-xs text-white/30">YouTube • Official</span>
              </div>
              <DetailsTrailer movieId={details.id} title={details.title} year={details.release_date?.slice(0, 4) ?? null} initialKey={trailerKey} initialName={trailerName} error={trailerError} />
            </div>
            {/* OTT */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                <h2 className="text-lg font-bold">Where to Watch</h2>
                <span className="ml-auto text-xs text-white/30">TMDB • IN default</span>
              </div>
              <WatchProviders
                movieId={details.id}
                initialData={{
                  region: "IN",
                  link: watchLink,
                  flatrate: watchProvidersInitial?.flatrate ?? [],
                  rent: watchProvidersInitial?.rent ?? [],
                  buy: watchProvidersInitial?.buy ?? [],
                  free: watchProvidersInitial?.free ?? [],
                  ads: watchProvidersInitial?.ads ?? [],
                  hasData: !!watchProvidersInitial && !!((watchProvidersInitial.flatrate?.length || watchProvidersInitial.rent?.length || watchProvidersInitial.buy?.length || watchProvidersInitial.free?.length || watchProvidersInitial.ads?.length)),
                }}
                initialError={watchError}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-white/25">Trailer and OTT use real TMDB data • Availability varies, may need subscription • No hardcode</p>
        </section>

        {/* Cast & Crew */}
        <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
            <h2 className="text-lg font-bold">Cast &amp; Crew</h2>
            <span className="ml-auto text-xs text-white/30">TMDB credits</span>
          </div>
          <CastCrew credits={credits} error={creditsError} />
        </section>

        {/* Recommendations */}
        <section id="recommendations" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
            <h2 className="text-xl font-bold">
              {recMovies.length ? `Because you viewed "${details.title}"` : "No recommendations yet"}
            </h2>
            <p className="mt-1.5 text-sm text-white/50">
              {recMovies.length
                ? `TMDB ${recSource} • Not personalized AI • Click to explore another`
                : "No related titles found for this movie on TMDB."}
            </p>
            {recMovies.length > 0 ? (
              <MoodMovieGrid movies={recMovies} genreMap={genreRecord} />
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
                Try another movie. Recommendations use TMDB related-movie data.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
