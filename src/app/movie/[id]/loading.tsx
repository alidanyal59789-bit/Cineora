export default function Loading() {
  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <div className="h-[68px] border-b border-white/[0.06] bg-[#060610]/70" />
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
            <div className="h-20 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="h-10 w-48 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
