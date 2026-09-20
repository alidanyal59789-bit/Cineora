"use client";

import { useState } from "react";
import type { TMDBMovie } from "@/lib/tmdb";
import { AddToCollectionModal, CollectionFormModal } from "@/components/CollectionModals";
import { useCollections } from "@/hooks/useCollections";

// Small trigger that opens the collection picker. Watchlist behavior untouched.
export default function AddToCollectionButton({
  movie,
  variant = "card",
}: {
  movie: TMDBMovie;
  variant?: "card" | "details";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { createCollectionAsync } = useCollections();

  function openPicker(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setPickerOpen(true);
  }

  if (variant === "details") {
    return (
      <>
        <button
          onClick={openPicker}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          + Collection
        </button>
        {pickerOpen && !createOpen && (
          <AddToCollectionModal
            movie={movie}
            onClose={() => setPickerOpen(false)}
            onCreateNew={() => setCreateOpen(true)}
          />
        )}
        {createOpen && (
          <CollectionFormModal
            mode="create"
            pendingLabel="Creating…"
            onClose={() => setCreateOpen(false)}
            onSubmit={async (name, description) => {
              const res = await createCollectionAsync(name, description);
              if (res.ok) {
                setCreateOpen(false);
                // Return to the picker so the movie can be saved right away.
                setPickerOpen(true);
              }
              return res;
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={openPicker}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
        aria-label="Save to collection"
        title="Save to collection"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {pickerOpen && !createOpen && (
        <AddToCollectionModal
          movie={movie}
          onClose={() => setPickerOpen(false)}
          onCreateNew={() => setCreateOpen(true)}
        />
      )}
      {createOpen && (
        <CollectionFormModal
          mode="create"
          pendingLabel="Creating…"
          onClose={() => setCreateOpen(false)}
          onSubmit={async (name, description) => {
            const res = await createCollectionAsync(name, description);
            if (res.ok) {
              setCreateOpen(false);
              setPickerOpen(true);
            }
            return res;
          }}
        />
      )}
    </>
  );
}
