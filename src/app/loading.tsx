import { MovieCardSkeleton } from "@/components/MovieCard";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <div className="h-[68px] border-b border-white/[0.06] bg-[#060610]/70" />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-[560px] animate-pulse rounded-[28px] bg-white/[0.06]" />
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
