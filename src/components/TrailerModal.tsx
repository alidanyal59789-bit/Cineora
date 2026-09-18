"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  movieId: number | null;
  title: string;
};

export default function TrailerButton({ movieId, title }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);

  const fetchTrailer = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    setKey(null);
    try {
      // fetch from our secure API route - TMDB key stays server-side
      const res = await fetch(`/api/trailer/${movieId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load trailer");
      if (!data.key) {
        setError(data.message || "No trailer available for this title.");
      } else {
        setKey(data.key);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading trailer");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const handleOpen = () => {
    if (!movieId) {
      setError("No movie selected");
      setOpen(true);
      return;
    }
    setOpen(true);
    fetchTrailer();
  };

  const handleClose = () => {
    setOpen(false);
    setKey(null);
    setError(null);
    setLoading(false);
  };

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-7 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(236,72,153,0.35)] transition hover:brightness-110 active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
        Watch Trailer
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* backdrop */}
          <button
            aria-label="Close trailer"
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          {/* modal card */}
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c1a] shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="truncate text-sm font-semibold text-white">
                {title ? `Trailer - ${title}` : "Trailer"}
              </h3>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="relative aspect-video bg-black">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0c0c1a]">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <p className="text-sm text-white/60">Loading trailer from TMDB...</p>
                </div>
              )}
              {error && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">🎬</div>
                  <p className="max-w-md text-sm leading-6 text-white/70">{error}</p>
                  <p className="text-xs text-white/30">Uses TMDB /movie/{"{id}"}/videos - YouTube key only, no fake URLs.</p>
                </div>
              )}
              {key && !loading && !error && (
                <iframe
                  src={`https://www.youtube.com/embed/${key}?autoplay=1&rel=0`}
                  title={`Trailer for ${title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              )}
            </div>

            {/* footer note */}
            <div className="px-5 py-3 text-center text-xs text-white/30">
              Powered by TMDB • YouTube embed • Server-side fetch, key hidden
            </div>
          </div>
        </div>
      )}
    </>
  );
}
