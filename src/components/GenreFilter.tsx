"use client";

import { useState } from "react";

const genres = ["All", "Action", "Sci-Fi", "Drama", "Thriller", "Comedy", "Horror", "Romance", "Animation"];

export default function GenreFilter({ onChange }: { onChange?: (genre: string) => void }) {
  const [active, setActive] = useState("All");

  const handle = (g: string) => {
    setActive(g);
    onChange?.(g);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {genres.map((g) => {
        const isActive = g === active;
        return (
          <button
            key={g}
            onClick={() => handle(g)}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "border-transparent bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-[0_6px_16px_rgba(236,72,153,0.35)]"
                : "border-white/10 bg-white/[0.06] text-white/60 hover:border-white/15 hover:bg-white/10 hover:text-white"
            }`}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}
