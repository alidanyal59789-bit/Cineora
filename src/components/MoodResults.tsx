import Link from "next/link";
import { getMoodMovies, MOOD_GENRE_MAP } from "@/lib/tmdb";
import MoodMovieGrid from "@/components/MoodMovieGrid";

const MOOD_LABELS: Record<string, { title: string; desc: string; genres: string }> = {
  feelgood: { title: "Feel Good", desc: "Comedy & Family", genres: "35, 10751" },
  mindbending: { title: "Mind Bending", desc: "Mystery & Sci-Fi", genres: "9648, 878" },
  heartbreak: { title: "Heartbreak", desc: "Drama & Romance", genres: "18, 10749" },
  adrenaline: { title: "Adrenaline Rush", desc: "Action & Thriller", genres: "28, 53" },
  cozy: { title: "Cozy Night", desc: "Family, Comedy & Animation", genres: "10751, 35" },
  dark: { title: "Dark & Gritty", desc: "Crime, Thriller & Horror", genres: "80, 53, 27" },
};

export default async function MoodResults({ mood, genreMap }: { mood: string; genreMap: Record<number, string> }) {
  const label = MOOD_LABELS[mood] ?? { title: mood, desc: "", genres: "" };
  let movies: Awaited<ReturnType<typeof getMoodMovies>> = [];
  let error: string | null = null;

  try {
    movies = await getMoodMovies(mood);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load mood movies";
  }

  const genreIds = MOOD_GENRE_MAP[mood] ?? [];

  return (
    <section id="mood-results" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a14] p-[1px]">
        <div className="rounded-[27px] bg-[#0c0c1a] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ec4899]/20 bg-[#ec4899]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#f9a8d4]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ec4899]" />
                MOOD • {label.title.toUpperCase()}
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {label.title} picks for you
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-sm leading-6 text-white/50">
                {label.desc} • Genres {label.genres} • {movies.length} movies • TMDB discover?with_genres • Not AI
              </p>
            </div>
            <Link
              href="/#discover"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Clear mood ✕
            </Link>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <h3 className="text-sm font-semibold text-red-200">Couldn&apos;t load {label.title} movies</h3>
              <p className="mt-2 text-sm text-white/60">{error}</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">🎭</div>
              <h3 className="mt-4 text-sm font-semibold text-white">No results for {label.title}</h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-white/50">
                TMDB returned no movies for genres {genreIds.join(", ")}. Try another mood.
              </p>
            </div>
          ) : (
            <>
              <MoodMovieGrid movies={movies} genreMap={genreMap} />
              <p className="mt-6 text-center text-xs text-white/25">
                Click poster to view details or use Details button • Works together with search & filters (URL keeps ?q & ?genre) • Server-side TMDB fetch
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
