"use client";

import Link from "next/link";

export default function DetailsButton({ id }: { id: number }) {
  return (
    <Link
      href={`/movie/${id}`}
      onClick={(e) => e.stopPropagation()}
      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-xs font-semibold text-black transition hover:bg-white/90"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5.14v14l11-7-11-7z" />
      </svg>
      Details
    </Link>
  );
}
