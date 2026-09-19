"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const navLinks = [
  { label: "Discover", href: "/#discover" },
  { label: "Trending", href: "/#trending" },
  { label: "Collections", href: "/collections" },
  { label: "Watchlist", href: "/watchlist" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useWatchlist();
  const { user } = useUser();
  const router = useRouter();

  const avatarInitial =
    user?.email?.charAt(0)?.toUpperCase() ??
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ??
    "A";

  async function handleSignOut() {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setMobileOpen(false);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060610]/70 backdrop-blur-xl">
      {/* subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ec4899]/40 to-transparent" />
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="Cineora home">
          <Image
            src="/cineora-logo.png"
            alt="Cineora"
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-lg object-contain sm:h-10 sm:w-10"
          />
          <span className="hidden rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-widest text-white/60 sm:inline-flex">
            PREMIUM
          </span>
        </Link>

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

          {user ? (
            <button
              onClick={handleSignOut}
              className="hidden h-9 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex"
            >
              Sign In
            </Link>
          )}

          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] p-[1.5px] sm:flex" title={user?.email ?? "Guest"}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a1a2e] text-xs font-bold text-white">
              {avatarInitial}
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
            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-3 flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
              >
                Sign Out{user.email ? ` (${user.email})` : ""}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex h-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
