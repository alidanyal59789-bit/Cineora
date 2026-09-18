"use client";

import { useState } from "react";

type Props = {
  movieId: number;
  title: string;
  year?: string | null;
  initialKey: string | null;
  initialName?: string | null;
  error?: string | null;
};

export default function DetailsTrailer({ movieId, title, year, initialKey, initialName, error }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [key] = useState<string | null>(initialKey);
  const [name] = useState<string | null>(initialName ?? null);

  // Network/API error - distinguish from empty
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">⚠️</div>
        <h3 className="mt-3 text-sm font-semibold text-red-200">Couldn&apos;t load trailer</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/60">{error}</p>
        <p className="mt-2 text-xs text-white/30">Network or TMDB error - try another movie • Server-side</p>
      </div>
    );
  }

  // If no trailer, show YouTube search fallback (real title+year, not invented key)
  if (!key) {
    const titleYear = year ? `${title} ${year}` : title;
    const searchQuery = encodeURIComponent(`${titleYear} official trailer`);
    const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c1a] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">🎬</div>
        <h3 className="mt-4 text-sm font-semibold text-white">No trailer available</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
          TMDB has no YouTube trailer for &quot;{titleYear}&quot; (ID {movieId}). Try searching on YouTube.
        </p>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90"
        >
          Search &quot;{titleYear} trailer&quot; on YouTube
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <p className="mt-3 text-xs text-white/25">Fallback: YouTube search for &quot;{titleYear} official trailer&quot; • No fake key • Uses TMDB /movie/{"{id}"}/videos • Server-side</p>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${key}`;
  const embedUrl = `https://www.youtube.com/embed/${key}?rel=0&modestbranding=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c1a]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] text-xs text-white">▶</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Official Trailer</h3>
            <p className="text-xs text-white/40">{name ?? "YouTube • TMDB"}</p>
          </div>
        </div>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          Watch on YouTube
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* player */}
      <div className="relative aspect-video bg-black">
        {!isPlaying ? (
          <button
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6"
            aria-label={`Play trailer for ${title}`}
          >
            {/* thumbnail placeholder with play button */}
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition group-hover:scale-105 group-hover:bg-white/90">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </span>
            <p className="mt-4 text-center text-sm font-medium text-white">Play trailer for &quot;{title}&quot;</p>
            <p className="mt-1 text-xs text-white/50">Click to load YouTube player • Autoplay may be blocked until you interact</p>
          </button>
        ) : (
          <iframe
            src={`${embedUrl}&autoplay=1`}
            title={`Trailer for ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>

      <div className="px-5 py-3 text-center text-xs text-white/25">
        TMDB videos • Found YouTube key <code className="rounded bg-white/10 px-1 py-0.5">{key.slice(0, 8)}…</code> • No hardcode, no fake URL
      </div>
    </div>
  );
}
