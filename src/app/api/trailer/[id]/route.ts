import { NextResponse } from "next/server";
import { getMovieVideos, findTrailer } from "@/lib/tmdb";

// Server-side secure handler - API key stays on server, never exposed to client
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie id" }, { status: 400 });
  }
  try {
    const videos = await getMovieVideos(movieId);
    const trailer = findTrailer(videos);
    if (!trailer) {
      return NextResponse.json({ key: null, message: "No trailer available for this movie on TMDB." });
    }
    return NextResponse.json({ key: trailer.key, name: trailer.name, site: trailer.site });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch trailer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
