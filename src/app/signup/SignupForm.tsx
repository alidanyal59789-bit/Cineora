"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!configured) {
      setError("Supabase is not configured yet. Add keys to .env.local and restart.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setSuccess("Account created. Check your email to confirm, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Join{" "}
        <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
          Cineora
        </span>
      </h1>
      <p className="mt-2 text-sm text-white/50">Create an account to sync your watchlist.</p>

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
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs leading-5 text-emerald-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSignUp} className="mt-6 flex flex-col gap-3">
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
          autoComplete="new-password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-11 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-white/40">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
