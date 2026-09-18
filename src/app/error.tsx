"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#060610] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1e] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">⚠️</div>
        <h2 className="mt-4 text-xl font-bold">Couldn&apos;t load movies</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          TMDB is unavailable or your API key is invalid. Check <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code> has <code className="rounded bg-white/10 px-1.5 py-0.5">TMDB_API_KEY</code> and restart <code className="rounded bg-white/10 px-1.5 py-0.5">npm run dev</code>.
        </p>
        <p className="mt-3 text-xs text-white/30 line-clamp-3">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
          Try again
        </button>
      </div>
    </div>
  );
}
