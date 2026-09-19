import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign In — Cineora",
  description: "Sign in to Cineora to sync your watchlist.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main className="mx-auto flex max-w-[1280px] flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="h-[420px] w-full max-w-md animate-pulse rounded-[28px] bg-white/[0.04]" />
          }
        >
          <LoginForm />
        </Suspense>
        <Link
          href="/"
          className="mt-6 text-xs text-white/40 hover:text-white"
        >
          ← Back to discover
        </Link>
      </main>
      <Footer />
    </div>
  );
}
