"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TMDBMovie } from "@/lib/tmdb";
import { useCollections } from "@/hooks/useCollections";
import { useUser } from "@/hooks/useUser";

// Shared polished modal shell - Cineora dark theme, keyboard accessible.
export function ModalShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative my-auto max-h-[92dvh] w-[min(100%,28rem)] overflow-y-auto overscroll-contain rounded-[24px] border border-white/10 bg-[#0c0c1a] p-5 shadow-2xl shadow-black/60 sm:p-6"
      >
        {children}
      </div>
    </div>
  );
}

function SignInPrompt({ action }: { action: string }) {
  const pathname = usePathname();
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-xl">
        🔒
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">Sign in required</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-white/50">
        Please sign in {action}. Your collections sync across devices.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
      >
        Sign In
      </Link>
    </div>
  );
}

const inputClass =
  "min-h-[44px] h-11 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 text-base text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none disabled:opacity-50 sm:text-sm";

// Create / rename form. Name required, description optional.
export function CollectionFormModal({
  mode,
  initialName = "",
  initialDescription = "",
  pendingLabel,
  onClose,
  onSubmit,
}: {
  mode: "create" | "rename";
  initialName?: string;
  initialDescription?: string;
  pendingLabel: string;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const { user, isLoading: userLoading } = useUser();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus({ preventScroll: true });
  }, []);

  // While the session is still loading (slow mobile networks), don't flash
  // a sign-in wall - show a skeleton so a signed-in user never sees a
  // misleading prompt.
  if (userLoading) {
    return (
      <ModalShell label={mode === "create" ? "Create collection" : "Rename collection"} onClose={onClose}>
        <div className="h-11 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="mt-3 h-11 animate-pulse rounded-full bg-white/[0.04]" />
        <div className="mt-4 flex gap-2">
          <div className="h-11 flex-1 animate-pulse rounded-full bg-white/[0.04]" />
          <div className="h-11 flex-1 animate-pulse rounded-full bg-white/[0.04]" />
        </div>
      </ModalShell>
    );
  }

  if (!user) {
    return (
      <ModalShell label={mode === "create" ? "Create collection" : "Rename collection"} onClose={onClose}>
        <SignInPrompt action={mode === "create" ? "to create collections" : "to rename this collection"} />
      </ModalShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return; // prevent duplicate submissions
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a collection name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await onSubmit(trimmed, description.trim());
      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell label={mode === "create" ? "Create collection" : "Rename collection"} onClose={onClose}>
      <h2 className="text-lg font-bold">{mode === "create" ? "New Collection" : "Rename Collection"}</h2>
      <p className="mt-1 text-xs text-white/40">
        {mode === "create" ? "Give your list a name and an optional note." : "Edit the name and description."}
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <label className="sr-only" htmlFor="collection-name">Collection name</label>
        <input
          id="collection-name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name (required)"
          maxLength={60}
          disabled={saving}
          autoComplete="off"
          enterKeyHint="next"
          className={inputClass}
        />
        <label className="sr-only" htmlFor="collection-description">Description (optional)</label>
        <input
          id="collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          maxLength={140}
          disabled={saving}
          autoComplete="off"
          enterKeyHint="done"
          className={inputClass}
        />
        {error && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
            {error}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? pendingLabel : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// Delete confirmation - deleting only removes the list and its
// collection_items (DB cascade). Watchlist and other lists are untouched.
export function DeleteCollectionDialog({
  name,
  onClose,
  onConfirm,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell label={`Delete ${name}`} onClose={onClose}>
      <h2 className="text-lg font-bold">Delete collection?</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        &quot;{name}&quot; and its saved movies will be removed. Movies stay in your watchlist and
        other collections.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/10"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-red-500/90 text-sm font-semibold text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}

// Picker shown from movie cards / details page.
export function AddToCollectionModal({
  movie,
  onClose,
  onCreateNew,
}: {
  movie: TMDBMovie;
  onClose: () => void;
  onCreateNew: () => void;
}) {
  const { user, isLoading: userLoading } = useUser();
  const { collections, isLoaded, addToCollection, isInCollection } = useCollections();
  const [addingId, setAddingId] = useState<string | null>(null);

  function handleAdd(collectionId: string) {
    if (isInCollection(collectionId, movie.id)) return; // already saved - no duplicates
    setAddingId(collectionId);
    addToCollection(collectionId, movie);
    // Remote sync is fire-and-forget inside the hook; close promptly.
    setAddingId(null);
    onClose();
  }

  return (
    <ModalShell label={`Add ${movie.title} to a collection`} onClose={onClose}>
      <h2 className="truncate text-lg font-bold" title={movie.title}>
        Save to collection
      </h2>
      <p className="mt-1 truncate text-xs text-white/40" title={movie.title}>
        {movie.title}
      </p>

      {!user && !userLoading ? (
        <div className="mt-4">
          <SignInPrompt action="to save movies to collections" />
        </div>
      ) : !isLoaded || userLoading ? (
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-white/[0.04]" />
      ) : collections.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-white/50">You don&apos;t have any collections yet.</p>
          <button
            onClick={onCreateNew}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
          >
            + Create Collection
          </button>
        </div>
      ) : (
        <ul className="mt-4 flex max-h-[40vh] flex-col gap-1.5 overflow-y-auto">
          {collections.map((c) => {
            const saved = isInCollection(c.id, movie.id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => handleAdd(c.id)}
                  disabled={saved || addingId !== null}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-default ${
                    saved
                      ? "border-[#ec4899]/20 bg-[#ec4899]/10"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{c.name}</span>
                    <span className="block text-xs text-white/40">
                      {c.movies.length} {c.movies.length === 1 ? "movie" : "movies"}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      saved ? "bg-[#ec4899]/20 text-[#f9a8d4]" : "bg-white/10 text-white"
                    }`}
                  >
                    {saved ? "Saved ✓" : addingId === c.id ? "Saving…" : "Save"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {user && collections.length > 0 && (
        <button
          onClick={onCreateNew}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/10"
        >
          + New Collection
        </button>
      )}
    </ModalShell>
  );
}
