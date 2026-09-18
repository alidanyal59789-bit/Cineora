"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const YEARS = ["", "2024", "2023", "2022", "2021", "2020"];
const RATINGS = ["", "8", "7", "6"];
const LANGUAGES = [
  { value: "", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "bn", label: "Bengali" },
  { value: "ml", label: "Malayalam" },
  { value: "kn", label: "Kannada" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
];

export default function AdvancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentYear = searchParams.get("year") ?? "";
  const currentRating = searchParams.get("rating") ?? "";
  const currentLang = searchParams.get("language") ?? "";

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/?${qs}#trending` : "/#trending"));
  };

  const hasAny = !!currentYear || !!currentRating || !!currentLang;

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Year</label>
          <select
            value={currentYear}
            onChange={(e) => update("year", e.target.value)}
            className="rounded-full border border-white/10 bg-[#0a0a14] px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="">Any</option>
            {YEARS.filter(Boolean).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Min Rating</label>
          <select
            value={currentRating}
            onChange={(e) => update("rating", e.target.value)}
            className="rounded-full border border-white/10 bg-[#0a0a14] px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="">Any</option>
            {RATINGS.filter(Boolean).map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Language</label>
          <select
            value={currentLang}
            onChange={(e) => update("language", e.target.value)}
            className="rounded-full border border-white/10 bg-[#0a0a14] px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {hasAny && (
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("year");
              params.delete("rating");
              params.delete("language");
              const qs = params.toString();
              startTransition(() => router.push(qs ? `/?${qs}#trending` : "/#trending"));
            }}
            className="ml-auto rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/15"
          >
            Clear filters
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-white/25">Filters combine: Genre + Year + Rating + Language + Sort • All use TMDB discover • Search + filters work together</p>
    </div>
  );
}
