import Link from "next/link";

export default function MovieNotFound() {
  return (
    <div className="min-h-screen bg-[#060610] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0c1a] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">🎬</div>
        <h2 className="mt-4 text-xl font-bold">Movie not found</h2>
        <p className="mt-2 text-sm text-white/50">TMDB has no movie with this ID (404). It may have been removed. Try another movie from the grid.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
          Back to home
        </Link>
      </div>
    </div>
  );
}
