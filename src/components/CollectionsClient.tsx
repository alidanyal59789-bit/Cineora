"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { useCollections, type UserCollection } from "@/hooks/useCollections";
import { useUser } from "@/hooks/useUser";
import {
  CollectionFormModal,
  DeleteCollectionDialog,
} from "@/components/CollectionModals";

function PosterStrip({ collection }: { collection: UserCollection }) {
  const previews = collection.movies.slice(0, 4);
  if (previews.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-white/30">
        No movies yet
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {previews.map((m) => {
        const poster = posterUrl(m.poster_path, "w185");
        return (
          <div
            key={m.id}
            className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#1a1033] to-[#0f172a]"
            title={m.title}
          >
            {poster ? (
              <Image
                src={poster}
                alt={m.title}
                fill
                sizes="120px"
                loading="lazy"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/40">
                {m.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CollectionCard({
  collection,
  onRename,
  onDelete,
}: {
  collection: UserCollection;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15">
      <div className="flex items-start gap-3">
        <Link
          href={`/collections/${collection.id}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] text-base font-bold text-white"
          aria-label={`Open ${collection.name}`}
        >
          {collection.name.charAt(0).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/collections/${collection.id}`} className="hover:underline">
            <h3 className="truncate font-semibold text-white" title={collection.name}>
              {collection.name}
            </h3>
          </Link>
          {collection.description && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/50" title={collection.description}>
              {collection.description}
            </p>
          )}
          <p className="mt-1 text-xs text-white/40">
            {collection.movies.length} {collection.movies.length === 1 ? "movie" : "movies"}
          </p>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${collection.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
          >
            •••
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-9 z-30 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c1a] p-1 shadow-2xl shadow-black/50"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onRename();
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                Rename
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-red-500/10 hover:text-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <PosterStrip collection={collection} />
      </div>
      <Link
        href={`/collections/${collection.id}`}
        className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
      >
        Open collection
      </Link>
    </article>
  );
}

export default function CollectionsClient() {
  const {
    collections,
    isLoaded,
    user,
    createCollectionAsync,
    renameCollectionAsync,
    deleteCollection,
  } = useCollections();
  const { isLoading: userLoading } = useUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<UserCollection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserCollection | null>(null);

  return (
    <section className="mt-12 rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">My Collections</h2>
          <p className="mt-1 text-xs text-white/40">
            {user
              ? "Your private lists • Synced to your account"
              : "Sign in to create private lists that sync across devices"}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-white/90"
          >
            + New Collection
          </button>
        )}
      </div>

      {!isLoaded || userLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      ) : !user ? (
        <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-xl">
            🔒
          </div>
          <h3 className="mt-4 text-sm font-semibold text-white">Sign in to build your collections</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
            Create private movie lists, save titles from any card, and sync everything to your
            account.
          </p>
          <Link
            href="/login?next=%2Fcollections"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
          >
            Sign In
          </Link>
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/50">You haven&apos;t created any collections yet.</p>
          <p className="mt-1 text-xs text-white/30">
            Group movies by mood, genre, or watch plans — they stay private to your account.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-6 text-sm font-semibold text-white hover:opacity-90"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              onRename={() => setRenameTarget(col)}
              onDelete={() => setDeleteTarget(col)}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CollectionFormModal
          mode="create"
          pendingLabel="Creating…"
          onClose={() => setCreateOpen(false)}
          onSubmit={(name, description) => createCollectionAsync(name, description)}
        />
      )}

      {renameTarget && (
        <CollectionFormModal
          mode="rename"
          initialName={renameTarget.name}
          initialDescription={renameTarget.description}
          pendingLabel="Saving…"
          onClose={() => setRenameTarget(null)}
          onSubmit={(name, description) => renameCollectionAsync(renameTarget.id, name, description)}
        />
      )}

      {deleteTarget && (
        <DeleteCollectionDialog
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteCollection(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </section>
  );
}
