"use client";

import { useState } from "react";
import { useCollections } from "@/hooks/useCollections";
import MovieCard from "@/components/MovieCard";

export default function CollectionsClient() {
  const { collections, isLoaded, createCollection, deleteCollection, removeFromCollection } = useCollections();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createCollection(name);
    setName("");
  };

  return (
    <section className="mt-12 rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">My Collections</h2>
          <p className="mt-1 text-xs text-white/40">Guest collections stored locally • Create your own lists and add movies from any card</p>
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New collection name"
            className="h-10 w-[200px] rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
          <button
            onClick={handleCreate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-white/90"
          >
            Create
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <div className="mt-6 h-20 animate-pulse rounded-xl bg-white/[0.04]" />
      ) : collections.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/50">No custom collections yet. Create one above, then add movies from any card via your watchlist or collection picker.</p>
          <p className="mt-2 text-xs text-white/25">Stored in localStorage only • Does not sync between devices</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {collections.map((col) => (
            <div key={col.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {col.name} <span className="ml-2 text-xs font-normal text-white/40">{col.movies.length} titles</span>
                </h3>
                <button onClick={() => deleteCollection(col.id)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 hover:bg-red-500/20 hover:text-red-200">
                  Delete
                </button>
              </div>
              {col.movies.length === 0 ? (
                <p className="mt-3 text-xs text-white/30">No movies yet. Add from movie cards.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {col.movies.map((m, idx) => (
                    <div key={m.id} className="relative">
                      <MovieCard movie={m} genreName="Collection" index={idx} />
                      <button
                        onClick={() => removeFromCollection(col.id, m.id)}
                        className="absolute right-3 top-12 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur hover:bg-red-500/80"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
