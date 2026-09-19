"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const urlError = searchParams.get("error");
  const initialError =
    urlError === "callback"
      ? "Sign-in callback failed. Please try again."
      : urlError === "config"
        ? "Authentication is not configured on this deployment. Please try again later."
        : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const configured = isSupabaseConfigured();

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!configured) {
      setError("Supabase is not configured yet. Add keys to .env.local and restart.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    if (!configured) {
      setError("Supabase is not configured yet. Add keys to .env.local and restart.");
      return;
    }
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back to{" "}
        <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
          Cineora
        </span>
      </h1>
      <p className="mt-2 text-sm text-white/50">Sign in to sync your watchlist across devices.</p>

      {!configured && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          Supabase keys are missing. Fill <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>, then restart dev
          server.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading || loading}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.6-5.35 3.6a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 2a9 9 0 0 0 0 18c5.2 0 8.65-3.65 8.65-8.8 0-.35-.05-.75-.3-1.1Z"
            fill="currentColor"
          />
        </svg>
        {oauthLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] text-white/30">
        <span className="h-px flex-1 bg-white/10" />
        OR WITH EMAIL
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="mt-1 h-11 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-white/40">
        New to Cineora?{" "}
        <Link href="/signup" className="font-semibold text-white hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
