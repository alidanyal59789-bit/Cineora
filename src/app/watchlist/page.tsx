"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistPage() {
  const { watchlist, isLoaded, removeFromWatchlist, clearWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">Watchlist</span>
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {isLoaded ? `${watchlist.length} ${watchlist.length === 1 ? "movie" : "movies"} saved • Guest watchlist stored in this browser` : "Loading your watchlist..."}
            </p>
          </div>
          {watchlist.length > 0 && (
            <button
              onClick={clearWatchlist}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Content */}
        {!isLoaded ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-[20px] bg-white/[0.04]" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04] text-2xl">🎬</div>
            <h2 className="mt-6 text-xl font-semibold">Your watchlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
              Tap <span className="font-semibold text-white">Add to Watchlist</span> or the <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px]">+</span> on any movie card to save it here. Your list is stored locally in this browser and survives refreshes. It does not sync between devices.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/#trending" className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-7 text-sm font-semibold text-white">
                Discover movies
              </Link>
              <Link href="/collections" className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-7 text-sm font-semibold text-white">
                Browse collections
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/25">Tip: Invalid or corrupted saved data is cleared automatically.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {watchlist.map((movie, idx) => (
              <div key={movie.id} className="group relative">
                <MovieCard movie={movie} genreName="Watchlist" index={idx} />
                <button
                  onClick={() => removeFromWatchlist(movie.id)}
                  className="absolute right-3 top-12 flex h-7 items-center justify-center rounded-full bg-black/60 px-2.5 text-xs font-semibold text-white backdrop-blur border border-white/15 hover:bg-red-500/80"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center text-xs text-white/30">
          Guest watchlist • localStorage only • Does not sync between devices or accounts • Correct movie ID used for every entry • Duplicates prevented
        </div>
      </main>
      <Footer />
    </div>
  );
}
