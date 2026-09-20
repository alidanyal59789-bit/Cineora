"use client";

import type { TMDBMovie } from "@/lib/tmdb";
import WatchlistButton from "@/components/WatchlistButton";
import AddToCollectionButton from "@/components/AddToCollectionButton";

// Client-side action row for the (server-rendered) movie details page.
// Reuses the existing watchlist hook (via WatchlistButton) and the existing
// collection picker - no duplicate watchlist/collection systems.
// Layout stacks full-width on mobile, wraps inline on desktop.
export default function MovieDetailsActions({ movie }: { movie: TMDBMovie }) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <WatchlistButton movie={movie} variant="details" className="w-full sm:w-auto" />
      <div className="w-full sm:w-auto [&>button]:w-full [&>button]:justify-center [&>button]:sm:w-auto">
        <AddToCollectionButton movie={movie} variant="details" />
      </div>
    </div>
  );
}
