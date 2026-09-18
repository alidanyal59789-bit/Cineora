import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { getIndianMovies, getHindiMovies, getGenreMap } from "@/lib/tmdb";

export default async function IndianMoviesSection() {
  let indianMovies: Awaited<ReturnType<typeof getIndianMovies>> = [];
  let hindiMovies: Awaited<ReturnType<typeof getHindiMovies>> = [];
  let genreMap = new Map<number, string>();
  let error: string | null = null;

  try {
    const [indian, hindi, gMap] = await Promise.all([getIndianMovies(), getHindiMovies(), getGenreMap()]);
    indianMovies = indian;
    hindiMovies = hindi;
    genreMap = gMap;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load Indian movies";
  }

  const genreRecord: Record<number, string> = {};
  for (const [k, v] of genreMap) genreRecord[k] = v;

  if (error) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load Indian movies</h3>
          <p className="mt-2 text-sm text-white/60">{error}</p>
        </div>
      </section>
    );
  }

  if (indianMovies.length === 0 && hindiMovies.length === 0) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/50">No Indian movies found at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="indian-movies" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
        <div className="rounded-[27px] bg-[#0c0c1a] p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-orange-200">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                MADE IN INDIA • REGION IN
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Indian <span className="bg-gradient-to-r from-[#ff9933] via-white to-[#138808] bg-clip-text text-transparent">Cinema</span>
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-sm leading-6 text-white/50">
                Discover movies produced in India • All languages: Hindi, Tamil, Telugu, Bengali, Malayalam, Kannada • Real TMDB data
              </p>
            </div>
            <Link href="/?region=IN#trending" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/10">
              View all Indian
            </Link>
          </div>

          {/* All Indian movies */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-white/80">All Indian Produced (with_origin_country=IN, region=IN)</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {indianMovies.slice(0, 8).map((m, idx) => (
                <MovieCard key={m.id} movie={m} genreName={genreRecord[m.genre_ids[0]] ?? "Indian"} index={idx} />
              ))}
            </div>
          </div>

          {/* Hindi specifically */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-white/80">Hindi Cinema (with_original_language=hi)</h3>
            <p className="mt-1 text-xs text-white/40">Hindi is one of many Indian languages — not all Indian movies are Hindi. Try Tamil (ta), Telugu (te), Bengali (bn), Malayalam (ml), Kannada (kn) via filters.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hindiMovies.slice(0, 8).map((m, idx) => (
                <MovieCard key={m.id} movie={m} genreName={genreRecord[m.genre_ids[0]] ?? "Hindi"} index={idx} />
              ))}
            </div>
          </div>

          {/* Language quick filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { code: "hi", label: "Hindi" },
              { code: "ta", label: "Tamil" },
              { code: "te", label: "Telugu" },
              { code: "bn", label: "Bengali" },
              { code: "ml", label: "Malayalam" },
              { code: "kn", label: "Kannada" },
            ].map((lang) => (
              <Link
                key={lang.code}
                href={`/?language=${lang.code}#trending`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white"
              >
                {lang.label} ({lang.code})
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-white/25">
            Uses TMDB discover with with_origin_country=IN &amp; region=IN for Indian-produced, with_original_language for Hindi etc. • No fake data
          </p>
        </div>
      </div>
    </section>
  );
}
