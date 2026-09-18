"use client";

import Image from "next/image";
import { posterUrl, type TMDBMovie } from "@/lib/tmdb";
import DetailsButton from "@/components/DetailsButton";
import WatchlistButton from "@/components/WatchlistButton";

// Fallback gradient when poster is missing - keeps premium look
const fallbackGradients = [
  "from-[#7c3aed] via-[#4f46e5] to-[#06b6d4]",
  "from-[#ec4899] via-[#be185d] to-[#7c3aed]",
  "from-[#0f766e] via-[#065f46] to-[#1e3a8a]",
  "from-[#dc2626] via-[#991b1b] to-[#431407]",
  "from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]",
  "from-[#334155] via-[#1e293b] to-[#0f172a]",
];

function formatYear(date: string) {
  if (!date) return "—";
  return date.slice(0, 4);
}

export default function MovieCard({
  movie,
  genreName,
  index = 0,
}: {
  movie: TMDBMovie;
  genreName?: string;
  index?: number;
}) {
  const poster = posterUrl(movie.poster_path, "w500");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
  const year = formatYear(movie.release_date);
  const gradient = fallbackGradients[index % fallbackGradients.length];

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0f0f1e] transition hover:border-white/15 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {/* poster */}
      <div className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${gradient}`}>
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            unoptimized={false}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-white/80 backdrop-blur">
                {(genreName ?? "CINEMA").toUpperCase()}
              </div>
              <h3 className="mt-3 max-w-[14ch] text-lg font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {movie.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-white/70">{year}</p>
            </div>
          </>
        )}

        {/* dark gradient over image for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* top badge */}
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur border border-white/20">
          ★ {rating}
        </div>
        {index === 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-black">
            TOP 10
          </div>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 flex translate-y-2 flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="mb-3 line-clamp-3 text-xs leading-5 text-white/80">{movie.overview || "No overview available."}</p>
          <div className="flex gap-2">
            <DetailsButton id={movie.id} />
            <WatchlistButton movie={movie} variant="card" />
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="space-y-1.5 bg-[#0f0f1e] p-4">
        <h3 className="truncate text-[15px] font-semibold leading-tight text-white" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs">
          <span className="truncate pr-2 text-white/50">
            {genreName ?? "Trending"} • {year}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-amber-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state - matches card size
export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#0f0f1e]">
      <div className="aspect-[3/4] animate-pulse bg-white/[0.06]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}
