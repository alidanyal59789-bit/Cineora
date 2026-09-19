import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "Sign Up — Cineora",
  description: "Create a Cineora account to sync your watchlist.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main className="mx-auto flex max-w-[1280px] flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <SignupForm />
        <Link href="/" className="mt-6 text-xs text-white/40 hover:text-white">
          ← Back to discover
        </Link>
      </main>
      <Footer />
    </div>
  );
}
