"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SortOption } from "@/lib/tmdb";

const options: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "release_date", label: "Release Date" },
];

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") as SortOption | null) ?? "popularity";
  const [, startTransition] = useTransition();

  const handle = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "popularity") {
      params.delete("sort"); // default, keep URL clean
    } else {
      params.set("sort", value);
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/?${qs}#trending` : "/#trending"));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium text-white/40 sm:inline">Sort by:</span>
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1">
        {options.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handle(opt.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-white text-black shadow"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
