"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SortOption } from "@/lib/tmdb";

type Genre = { id: number; name: string };

export function GenreFilterBar({ genres }: { genres: Genre[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("genre") ?? "all";
  const [, startTransition] = useTransition();

  const setGenre = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("genre");
    else params.set("genre", id);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/?${qs}#trending` : "/#trending"));
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => setGenre("all")}
        className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
          activeId === "all"
            ? "border-transparent bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-[0_6px_16px_rgba(236,72,153,0.35)]"
            : "border-white/10 bg-white/[0.06] text-white/60 hover:border-white/15 hover:bg-white/10 hover:text-white"
        }`}
      >
        All
      </button>
      {genres.map((g) => {
        const isActive = activeId === String(g.id);
        return (
          <button
            key={g.id}
            onClick={() => setGenre(String(g.id))}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "border-transparent bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-[0_6px_16px_rgba(236,72,153,0.35)]"
                : "border-white/10 bg-white/[0.06] text-white/60 hover:border-white/15 hover:bg-white/10 hover:text-white"
            }`}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}

export function ActiveFiltersSummary({ genres }: { genres: Genre[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const genre = searchParams.get("genre");
  const sort = searchParams.get("sort") as SortOption | null;
  const router = useRouter();

  const genreName = genre ? genres.find((g) => String(g.id) === genre)?.name : null;
  const hasAny = !!q || !!genre || !!sort;

  if (!hasAny) return null;

  const clearAll = () => router.push("/#trending");

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {q && (
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-white/70">
          Search: <span className="font-semibold text-white">&quot;{q}&quot;</span>
        </span>
      )}
      {genreName && (
        <span className="rounded-full border border-[#ec4899]/20 bg-[#ec4899]/10 px-3 py-1.5 font-medium text-[#f9a8d4]">{genreName}</span>
      )}
      {sort && sort !== "popularity" && (
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-white/60">Sort: {sort}</span>
      )}
      <button onClick={clearAll} className="rounded-full bg-white px-3 py-1.5 font-semibold text-black hover:bg-white/90">
        Clear all
      </button>
    </div>
  );
}
