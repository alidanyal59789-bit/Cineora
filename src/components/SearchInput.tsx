"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

type Props = {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

// SearchInput = controlled input that syncs with URL ?q=
// Hinglish: user jo type karta hai, wo URL me ?q=... ban ke server tak jata hai
export default function SearchInput({ className, placeholder = "Search movies...", autoFocus }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();

  // Keep input in sync when URL changes via back/forward or clear
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Update URL - called on submit or debounced change
  const pushQuery = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    // Reset to page-like behavior: keep genre/sort when searching, remove empty q
    // Do not expose API key - only q/genre/sort go in URL
    const qs = params.toString();
    const href = qs ? `/?${qs}#trending` : "/#trending";
    startTransition(() => {
      router.push(href);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushQuery(value);
  };

  const handleClear = () => {
    setValue("");
    pushQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/40">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            aria-label="Search movies"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/15"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {/* Hidden submit keeps Enter key working; visible on desktop as icon */}
        <button
          type="submit"
          aria-label="Search"
          className="hidden h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 sm:inline-flex"
        >
          {isPending ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      {/* Enter button for mobile - inside form */}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
