"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import type { TMDBMovie } from "@/lib/tmdb";

type Props = {
  movie: TMDBMovie;
  variant?: "card" | "hero" | "details";
  className?: string;
};

export default function WatchlistButton({ movie, variant = "card", className = "" }: Props) {
  const { isInWatchlist, toggleWatchlist, isLoaded } = useWatchlist();
  const isSaved = isInWatchlist(movie.id);

  // Prevent parent card click (rec) when clicking watchlist
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist(movie);
  };

  if (variant === "details") {
    // Movie details page action: clearly visible Watch Later toggle.
    // Same toggle semantics as card/hero (guest local + Supabase sync when
    // signed in); card plus-button behavior untouched.
    return (
      <button
        onClick={handleClick}
        disabled={!isLoaded}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold backdrop-blur transition active:scale-[0.98] disabled:opacity-50 ${
          isSaved
            ? "border-[#ec4899]/30 bg-[#ec4899]/15 text-[#f9a8d4] hover:bg-[#ec4899]/20"
            : "border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
        } ${className}`}
        aria-label={isSaved ? "Remove from watchlist" : "Add to Watch Later"}
        aria-pressed={isSaved}
        title={isSaved ? "Remove from watchlist" : "Add to Watch Later"}
      >
        {isSaved ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added to Watchlist
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Watch Later
          </>
        )}
      </button>
    );
  }

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
