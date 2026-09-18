import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cineora — Discover Cinema Like Never Before",
  description:
    "Cineora is a premium cinematic movie discovery platform. Explore trending films, filter by genre, and find movies by mood with AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#060610] text-white selection:bg-[#ec4899]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
