"use client";

import { use, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { useCollections } from "@/hooks/useCollections";
import { useUser } from "@/hooks/useUser";
import {
  CollectionFormModal,
  DeleteCollectionDialog,
} from "@/components/CollectionModals";

export default function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { collections, isLoaded, user, renameCollectionAsync, deleteCollection, removeFromCollection } =
    useCollections();
  const { isLoading: userLoading } = useUser();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const collection = collections.find((c) => c.id === decodedId) ?? null;

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur"
        >
          ← All collections
        </Link>

        {!isLoaded || userLoading ? (
          <div className="mt-8 space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[360px] animate-pulse rounded-[20px] bg-white/[0.04]" />
              ))}
            </div>
          </div>
        ) : !user ? (
          <div className="mt-8 rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-10 text-center">
            <h1 className="text-xl font-semibold">Sign in to view your collections</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              Personal collections are private to each account.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent(`/collections/${decodedId}`)}`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
            >
              Sign In
            </Link>
          </div>
        ) : deleted || !collection ? (
          <div className="mt-8 rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-10 text-center">
            <h1 className="text-xl font-semibold">
              {deleted ? "Collection deleted" : "Collection not found"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              {deleted
                ? "Your movies are still safe in your watchlist and other collections."
                : "It may have been deleted, or this link belongs to another account."}
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
            >
              Back to collections
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl" title={collection.name}>
                  {collection.name}
                </h1>
                {collection.description ? (
                  <p className="mt-2 max-w-[60ch] text-sm leading-6 text-white/50">
                    {collection.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-white/30">
                    {collection.movies.length} {collection.movies.length === 1 ? "movie" : "movies"} • Private to your account
                  </p>
                )}
                {collection.description && (
                  <p className="mt-1 text-xs text-white/30">
                    {collection.movies.length} {collection.movies.length === 1 ? "movie" : "movies"} • Private to your account
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setRenameOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Rename
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-5 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            {collection.movies.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <p className="text-sm text-white/50">No movies in this collection yet.</p>
                <p className="mt-1 text-xs text-white/30">
                  Use the bookmark button on any movie card to save titles here.
                </p>
                <Link
                  href="/#trending"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Discover movies
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {collection.movies.map((movie, idx) => (
                  <div key={movie.id} className="group relative">
                    <MovieCard movie={movie} genreName={collection.name} index={idx} />
                    <button
                      onClick={() => removeFromCollection(collection.id, movie.id)}
                      aria-label={`Remove ${movie.title} from ${collection.name}`}
                      className="absolute right-3 top-12 flex h-7 items-center justify-center rounded-full border border-white/15 bg-black/60 px-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-red-500/80"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      {renameOpen && collection && (
        <CollectionFormModal
          mode="rename"
          initialName={collection.name}
          initialDescription={collection.description}
          pendingLabel="Saving…"
          onClose={() => setRenameOpen(false)}
          onSubmit={(name, description) => renameCollectionAsync(collection.id, name, description)}
        />
      )}

      {deleteOpen && collection && (
        <DeleteCollectionDialog
          name={collection.name}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => {
            deleteCollection(collection.id);
            setDeleteOpen(false);
            setDeleted(true);
          }}
        />
      )}
    </div>
  );
}
