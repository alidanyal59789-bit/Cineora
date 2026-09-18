"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import type { TMDBMovie } from "@/lib/tmdb";

type Props = {
  movie: TMDBMovie;
  variant?: "card" | "hero";
};

export default function WatchlistButton({ movie, variant = "card" }: Props) {
  const { isInWatchlist, toggleWatchlist, isLoaded } = useWatchlist();
  const isSaved = isInWatchlist(movie.id);

  // Prevent parent card click (rec) when clicking watchlist
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist(movie);
  };

  if (variant === "hero") {
    return (
      <button
        onClick={handleClick}
        disabled={!isLoaded}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-7 text-sm font-semibold backdrop-blur transition active:scale-[0.98] ${
          isSaved
            ? "border-[#ec4899]/30 bg-[#ec4899]/15 text-[#f9a8d4] hover:bg-[#ec4899]/20"
            : "border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
        }`}
        aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isSaved ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add to Watchlist
          </>
        )}
      </button>
    );
  }

  // card variant - small round button
  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded}
      className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
        isSaved
          ? "border-[#ec4899]/30 bg-[#ec4899] text-white hover:bg-[#ec4899]/90 shadow-[0_0_12px_rgba(236,72,153,0.4)]"
          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
      }`}
      aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
      title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isSaved ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
