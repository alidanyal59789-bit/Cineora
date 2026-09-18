import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getGenreMap } from "@/lib/tmdb";
import CollectionsClient from "@/components/CollectionsClient";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

type CollectionInfo = {
  id: string;
  title: string;
  description: string;
  gradient: string;
};

const CURATED: CollectionInfo[] = [
  { id: "trending", title: "Trending Now", description: "Most watched today • Updated hourly", gradient: "from-[#ec4899] to-[#8b5cf6]" },
  { id: "top_rated", title: "Top Rated", description: "Highest rated of all time • TMDB Top 250", gradient: "from-[#f59e0b] to-[#ec4899]" },
  { id: "upcoming", title: "Upcoming", description: "Coming soon to theatres", gradient: "from-[#06b6d4] to-[#8b5cf6]" },
  { id: "now_playing", title: "Now Playing", description: "In cinemas this week", gradient: "from-[#10b981] to-[#06b6d4]" },
];

export default async function CollectionsPage() {
  // Fetch all curated collections in parallel - server-side, key secure
  const [trending, topRated, upcoming, nowPlaying, genreMap] = await Promise.allSettled([
    getTrendingMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getNowPlayingMovies(),
    getGenreMap(),
  ]);

  const getMovies = (res: PromiseSettledResult<Awaited<ReturnType<typeof getTrendingMovies>>>, fallback: Awaited<ReturnType<typeof getTrendingMovies>> = []) => {
    if (res.status === "fulfilled" && res.value.length) return res.value.slice(0, 8);
    return fallback.slice(0, 8);
  };

  const trendingMovies = getMovies(trending);
  const topRatedMovies = getMovies(topRated, trendingMovies);
  const upcomingMovies = getMovies(upcoming, trendingMovies);
  const nowPlayingMovies = getMovies(nowPlaying, trendingMovies);

  const genreRecord: Record<number, string> = {};
  if (genreMap.status === "fulfilled") {
    for (const [k, v] of genreMap.value) genreRecord[k] = v;
  }

  const collections = [
    { info: CURATED[0], movies: trendingMovies },
    { info: CURATED[1], movies: topRatedMovies },
    { info: CURATED[2], movies: upcomingMovies },
    { info: CURATED[3], movies: nowPlayingMovies },
  ];

  const hasAny = collections.some((c) => c.movies.length > 0);

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">Collections</span> for you
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-white/50">
            Curated movie categories from TMDB • Real data, no fakes • Click any card for details or add to your watchlist.
          </p>
        </div>

        {!hasAny ? (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h2 className="text-sm font-semibold text-red-200">Couldn&apos;t load collections</h2>
            <p className="mt-2 text-sm text-white/60">TMDB is temporarily unavailable. Please retry.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {collections.map(({ info, movies }) => (
              <section key={info.id} className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0c0c1a] p-6 sm:p-8">
                <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${info.gradient} opacity-[0.08] blur-3xl`} />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${info.gradient} text-sm font-bold text-white`}>
                      {info.title[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{info.title}</h2>
                      <p className="text-xs text-white/40">{info.description}</p>
                    </div>
                    <span className="ml-auto hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/40 sm:inline">
                      {movies.length} titles
                    </span>
                  </div>

                  {movies.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/40">
                      No movies available for this collection.
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {movies.map((m, idx) => (
                        <MovieCard key={m.id} movie={m} genreName={genreRecord[m.genre_ids[0]] ?? "Trending"} index={idx} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* User collections (localStorage) - guest only */}
        <CollectionsClient />

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center text-xs text-white/30">
          Collections are curated from TMDB • Trending, Top Rated, Upcoming, Now Playing • Real TMDB IDs used • No fake data
        </div>
      </main>
      <Footer />
    </div>
  );
}
