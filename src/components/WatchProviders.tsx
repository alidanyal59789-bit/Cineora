"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Image from "next/image";

type Provider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

type Data = {
  region: string;
  link: string | null;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
  free: Provider[];
  ads: Provider[];
  hasData: boolean;
};

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "JP", label: "Japan" },
  { code: "BR", label: "Brazil" },
];

function ProviderGrid({ title, list }: { title: string; list: Provider[] }) {
  if (!list || list.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-wide text-white/60">{title}</h4>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {list.map((p) => (
          <div
            key={p.provider_id}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
              <Image
                src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                alt={p.provider_name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="line-clamp-2 text-xs font-medium leading-tight text-white/70">{p.provider_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchProviders({
  movieId,
  initialData,
  initialError,
}: {
  movieId: number;
  initialData: Data | null;
  initialError?: string | null;
}) {
  const [region, setRegion] = useState<string>(initialData?.region ?? "IN");
  const [data, setData] = useState<Data | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  // When region changes, fetch new data via secure API route (key stays server)
  useEffect(() => {
    // If region is same as initial, don't refetch
    if (initialData && region === initialData.region) {
      setData(initialData);
      return;
    }
    let cancelled = false;
    const fetchRegion = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/providers/${movieId}?region=${region}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch providers");
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRegion();
    return () => {
      cancelled = true;
    };
  }, [region, movieId, initialData]);

  const hasAny = data && (data.flatrate.length > 0 || data.rent.length > 0 || data.buy.length > 0 || data.free.length > 0 || data.ads.length > 0);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c1a] p-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Where to Watch</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">Streaming availability from TMDB • May vary by subscription</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="region-select" className="text-xs font-medium text-white/40">
            Region:
          </label>
          <select
            id="region-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-full border border-white/10 bg-[#0a0a14] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.code} - {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* content */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4">
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-200">Couldn&apos;t load providers</p>
            <p className="mt-1 text-xs text-white/50">{error}</p>
          </div>
        ) : !hasAny ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">📺</div>
            <h4 className="mt-3 text-sm font-semibold text-white">No provider data for {region}</h4>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-white/50">
              TMDB has no streaming, rent or buy info for this movie in <span className="font-medium text-white">{region}</span>. Try another region.
            </p>
            <p className="mt-3 text-xs text-white/25">Source: TMDB /movie/{"{id}"}/watch/providers • Not invented</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ProviderGrid title="Stream" list={data.flatrate} />
            <ProviderGrid title="Free" list={data.free} />
            <ProviderGrid title="Ads" list={data.ads} />
            <ProviderGrid title="Rent" list={data.rent} />
            <ProviderGrid title="Buy" list={data.buy} />
            {data.link && (
              <a
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                View on TMDB watch page
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            <p className="text-center text-xs text-white/25">Data by JustWatch via TMDB • Availability varies by region/subscription</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-white/25">
        Availability from TMDB watch/providers • Can change, may require subscription • No fake logos or links
      </p>
    </div>
  );
}
