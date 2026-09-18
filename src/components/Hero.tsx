import Image from "next/image";
import { backdropUrl, posterUrl, type TMDBMovie } from "@/lib/tmdb";
import TrailerButton from "@/components/TrailerModal";
import WatchlistButton from "@/components/WatchlistButton";

type HeroProps = {
  movie?: TMDBMovie | null;
};

function formatYear(date: string) {
  return date ? date.slice(0, 4) : "2024";
}

export default function Hero({ movie }: HeroProps) {
  // If no movie (API error / empty), show original premium placeholder (keeps design intact)
  const hasMovie = !!movie;
  const backdrop = movie ? backdropUrl(movie.backdrop_path, "w1280") : null;
  const poster = movie ? posterUrl(movie.poster_path, "w500") : null;
  const title = movie?.title ?? "DUNE PART TWO";
  const overview =
    movie?.overview ??
    "Paul Atreides unites with the Fremen to wage war against House Harkonnen. A breathtaking epic of destiny, power and survival beyond imagination.";
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : "9.1";
  const year = movie ? formatYear(movie.release_date) : "2024";

  // Split title for two-line gradient effect (first word + rest)
  const [firstWord, ...restWords] = title.split(" ");
  const rest = restWords.join(" ");

  return (
    <section className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#060610]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/[0.08] via-transparent to-[#8b5cf6]/[0.10]" />
      <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#ec4899]/[0.07] blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/[0.07] blur-[100px]" />

      <div className="relative mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
          <div className="relative overflow-hidden rounded-[27px] bg-[#0c0c1a]">
            {/* Hero inner grid */}
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left: artwork */}
              <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[560px]">
                {backdrop ? (
                  <>
                    <Image
                      src={backdrop}
                      alt={title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1a] via-[#0c0c1a]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0c0c1a]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/20 via-transparent to-[#8b5cf6]/20 mix-blend-overlay" />
                  </>
                ) : poster ? (
                  <>
                    <Image src={poster} alt={title} fill priority sizes="55vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1a] via-transparent to-transparent" />
                  </>
                ) : (
                  <>
                    {/* Fallback premium gradient (original design) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1033] via-[#2a0f2e] to-[#0f172a]" />
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(236,72,153,0.35),transparent_60%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.35),transparent_60%)]" />
                    </div>
                    <div className="absolute inset-0 flex items-end justify-center overflow-hidden opacity-30">
                      <div className="h-[60%] w-full bg-gradient-to-t from-[#ec4899]/20 to-transparent blur-[1px]" />
                    </div>
                    <div className="absolute bottom-0 left-[20%] h-[70%] w-px bg-gradient-to-t from-[#ec4899]/60 to-transparent" />
                    <div className="absolute bottom-0 left-[35%] h-[55%] w-px bg-gradient-to-t from-[#8b5cf6]/50 to-transparent" />
                    <div className="absolute bottom-0 right-[30%] h-[65%] w-px bg-gradient-to-t from-[#06b6d4]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0c0c1a]" />
                  </>
                )}

                {/* floating badges */}
                <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-black">FEATURED</span>
                  <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur border border-white/20">
                    {hasMovie ? "Trending #1 Today" : "#1 Trending"}
                  </span>
                </div>

                {/* bottom stats on artwork */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 sm:bottom-6 sm:left-6 sm:right-6 lg:hidden">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    {hasMovie ? "Live from TMDB" : "Now Streaming"}
                  </span>
                </div>
              </div>

              {/* Right: content */}
              <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-[#ec4899]/10 blur-3xl" />

                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-[#ec4899]/30 bg-[#ec4899]/15 px-3 py-1 font-semibold tracking-wide text-[#f9a8d4]">
                      {hasMovie ? "TRENDING • TMDB" : "SCI-FI • EPIC"}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-medium text-white/80">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {rating} / 10
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-medium text-white/60">
                      {year} • TMDB • {movie?.release_date ? new Date(movie.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "PG-13"}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-balance text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-[48px]">
                      <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">{firstWord}</span>
                      {rest && <span className="block bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">{rest}</span>}
                    </h1>
                    <p className="mt-4 line-clamp-4 max-w-[48ch] text-[15px] leading-6 text-white/60">{overview}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {hasMovie ? "98% Match • TMDB" : "98% Match"}
                    </span>
                    <span className="h-3 w-px bg-white/10" />
                    <span>IMAX • Dolby Atmos</span>
                    <span className="h-3 w-px bg-white/10" />
                    <span>4K HDR</span>
                  </div>

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <TrailerButton movieId={movie?.id ?? null} title={title} />
                    {movie ? (
                      <WatchlistButton movie={movie} variant="hero" />
                    ) : (
                      <button
                        disabled
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 text-sm font-semibold text-white/40 backdrop-blur"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Add to Watchlist
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-[#0c0c1a] bg-gradient-to-br from-zinc-400 to-zinc-600" />
                      <div className="h-8 w-8 rounded-full border-2 border-[#0c0c1a] bg-gradient-to-br from-amber-400 to-orange-600" />
                      <div className="h-8 w-8 rounded-full border-2 border-[#0c0c1a] bg-gradient-to-br from-violet-400 to-purple-600" />
                    </div>
                    <p className="text-xs leading-4 text-white/50">
                      {hasMovie ? (
                        <>
                          Release <span className="font-medium text-white/80">{movie?.release_date || "—"}</span> • Rating {rating}
                        </>
                      ) : (
                        <>
                          Starring <span className="font-medium text-white/80">Timothée Chalamet, Zendaya, Rebecca Ferguson</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-white/[0.02] px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-6 text-xs">
                <span className="flex items-center gap-2 font-medium text-white/70">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">▶</span>
                  {hasMovie ? "Live data from TMDB" : "2.4M watching now"}
                </span>
                <span className="hidden items-center gap-2 text-white/40 sm:flex">
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  {hasMovie ? `TMDB ID: ${movie?.id}` : "Critics Choice Winner 2024"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>Powered by TMDB</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-[#f9a8d4]">{hasMovie ? "Server-side fetch • Key hidden" : "No API needed • Local preview"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
