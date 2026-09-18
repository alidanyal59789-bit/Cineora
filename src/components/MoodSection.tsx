"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

const moods = [
  {
    id: "feelgood",
    emoji: "✨",
    title: "Feel Good",
    desc: "Uplifting stories that leave you smiling",
    gradient: "from-[#ec4899] to-[#f97316]",
    count: "124 films",
  },
  {
    id: "mindbending",
    emoji: "🧠",
    title: "Mind Bending",
    desc: "Twists, puzzles & reality questioning",
    gradient: "from-[#8b5cf6] to-[#06b6d4]",
    count: "89 films",
  },
  {
    id: "heartbreak",
    emoji: "💔",
    title: "Heartbreak",
    desc: "Beautifully devastating cinema",
    gradient: "from-[#ef4444] to-[#ec4899]",
    count: "67 films",
  },
  {
    id: "adrenaline",
    emoji: "⚡",
    title: "Adrenaline Rush",
    desc: "Edge-of-seat action & thrills",
    gradient: "from-[#f59e0b] to-[#ef4444]",
    count: "156 films",
  },
  {
    id: "cozy",
    emoji: "🍿",
    title: "Cozy Night",
    desc: "Warm, comfort-watch perfection",
    gradient: "from-[#10b981] to-[#06b6d4]",
    count: "102 films",
  },
  {
    id: "dark",
    emoji: "🌑",
    title: "Dark & Gritty",
    desc: "Noir, crime & atmospheric tension",
    gradient: "from-[#334155] to-[#0f172a]",
    count: "78 films",
  },
];

export default function MoodSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMood = searchParams.get("mood");
  const activeCustom = searchParams.get("customMood") ?? "";
  const [, startTransition] = useTransition();
  const [customInput, setCustomInput] = useState(activeCustom);

  // Keep input in sync with URL (back/forward, clear)
  useEffect(() => {
    setCustomInput(searchParams.get("customMood") ?? "");
  }, [searchParams]);

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeMood === id) {
      params.delete("mood");
    } else {
      params.set("mood", id);
      // Selecting a card clears custom text (they work independently)
      params.delete("customMood");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}#discover` : "/#discover");
    });
  };

  const handleCustomSubmit = () => {
    const trimmed = customInput.trim();
    // Prevent empty input from triggering request
    if (!trimmed) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("customMood", trimmed);
    // Custom text clears predefined mood (independent but not both at same time)
    params.delete("mood");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}#mood-results` : "/#mood-results");
    });
  };

  const handleCustomClear = () => {
    setCustomInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("customMood");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}#discover` : "/#discover");
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <section id="discover" className="relative">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
          <div className="rounded-[27px] bg-[#0c0c1a] p-6 sm:p-8 lg:p-10">
            {/* header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#f9a8d4]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#ec4899]" />
                  AI POWERED • NEW
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  What&apos;s your <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">mood</span> today?
                </h2>
                <p className="mt-2 max-w-[60ch] text-sm leading-6 text-white/55">
                  Pick a mood - we&apos;ll fetch TMDB movies by genre. Click again to clear.
                </p>
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-xs text-white/40">Try:</span>
                <button
                  onClick={() => handleSelect("heartbreak")}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
                >
                  &quot;I want to cry but feel hopeful&quot;
                </button>
              </div>
            </div>

            {/* mood cards grid - now clickable */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moods.map((m) => {
                const isActive = activeMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(m.id)}
                    className={`group relative overflow-hidden rounded-2xl p-[1px] text-left transition ${
                      isActive
                        ? "border border-[#ec4899]/50 bg-gradient-to-br from-[#ec4899]/30 to-[#8b5cf6]/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                        : "border border-white/[0.07] bg-white/[0.03] hover:border-white/15"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className={`relative h-full rounded-[15px] p-5 ${isActive ? "bg-[#1a1033]" : "bg-[#12121f]"}`}>
                      <div
                        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${m.gradient} blur-2xl transition ${isActive ? "opacity-40" : "opacity-20 group-hover:opacity-30"}`}
                      />
                      <div className={`absolute inset-0 rounded-[15px] bg-gradient-to-br ${m.gradient} ${isActive ? "opacity-[0.12]" : "opacity-[0.04] group-hover:opacity-[0.07]"}`} />

                      <div className="relative">
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} text-lg shadow-lg`}>
                          <span className="text-white drop-shadow">{m.emoji}</span>
                        </div>
                        <h3 className="mt-4 text-[15px] font-semibold text-white flex items-center gap-2">
                          {m.title}
                          {isActive && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">SELECTED</span>}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-white/50">{m.desc}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-medium text-white/30">{m.count}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? "border-white bg-white text-black"
                                : "border-white/10 bg-white/[0.06] text-white/80 group-hover:bg-white group-hover:text-black"
                            }`}
                          >
                            {isActive ? "Selected" : "Explore"}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transition group-hover:translate-x-0.5">
                              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* bottom search bar - now genuinely editable and functional */}
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:p-2">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-[#0a0a14] px-4 py-3 sm:rounded-full sm:py-2.5 border border-white/5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] text-sm">✦</span>
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Pick a mood above or describe: "something nostalgic and warm"'
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                  aria-label="Describe your mood"
                />
                {customInput && (
                  <button
                    onClick={handleCustomClear}
                    className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/15"
                    aria-label="Clear custom mood"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleCustomSubmit}
                disabled={!customInput.trim()}
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-7 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(236,72,153,0.3)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed sm:h-10"
              >
                Find My Movie
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-white/25">
              Uses TMDB <code className="rounded bg-white/10 px-1.5 py-0.5">/discover/movie?with_genres=</code> - genre IDs mapped per mood • Server-side, key hidden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export mood list for server reuse (mapping)
export { moods };
