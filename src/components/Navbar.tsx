"use client";

import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import { useWatchlist } from "@/hooks/useWatchlist";

const navLinks = [
  { label: "Discover", href: "/#discover" },
  { label: "Trending", href: "/#trending" },
  { label: "Collections", href: "/collections" },
  { label: "Watchlist", href: "/watchlist" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useWatchlist();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060610]/70 backdrop-blur-xl">
      {/* subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/40 to-transparent" />
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            {/* film/clapper icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 4V20M17 4V20M3 8H21M3 16H21M3 4H21V20H3V4Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="white" />
            </svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight">
            Cine<span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">ora</span>
          </span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-widest text-white/60 sm:inline-flex">
            PREMIUM
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium text-white/60 transition hover:text-white"
            >
              {link.label}
              {link.label === "Watchlist" && count > 0 && (
                <span className="absolute -right-5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search - desktop - Phase 4 functional */}
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/50 md:flex">
            <SearchInput className="w-[200px] xl:w-[260px]" />
            <span className="hidden rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60 xl:inline">↵</span>
          </div>

          <button
            aria-label="Search"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href="/watchlist"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white hover:bg-white/10 sm:inline-flex"
            aria-label="Watchlist"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-6-4.35-9-8.5C1.5 8.5 5 4 9.5 4c2 0 3.5 1.2 2.5 3 1-1.8 2.5-3 4.5-3 4.5 0 8 4.5 6.5 8.5-3 4.15-9 8.5-9 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <button className="hidden h-9 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex">
            Sign In
          </button>

          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] p-[1.5px] sm:flex">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a1a2e] text-xs font-bold text-white">
              A
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0a0a18] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                <span>{link.label}</span>
                {link.label === "Watchlist" && count > 0 && (
                  <span className="rounded-full bg-[#ec4899] px-2 py-0.5 text-xs font-bold text-white">{count}</span>
                )}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2.5">
                <SearchInput className="w-full" placeholder="Search movies..." onSubmitted={() => setMobileOpen(false)} />
              </div>
            </div>
            <button className="mt-3 flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
