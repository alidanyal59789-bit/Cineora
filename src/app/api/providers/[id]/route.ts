import { NextResponse } from "next/server";
import { getWatchProviders } from "@/lib/tmdb";

// Server-side secure handler - API key stays on server
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie id" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "IN").toUpperCase();

  try {
    const data = await getWatchProviders(movieId);
    const result = data.results[region] || null;
    // Safe diagnostic: log whether region has data vs empty vs error, without key
    if (!result) console.log(`[Providers] no data for ${movieId} region ${region}, available: ${Object.keys(data.results).slice(0,5).join(",")}`);
    return NextResponse.json({
      region,
      link: result?.link ?? null,
      flatrate: result?.flatrate ?? [],
      rent: result?.rent ?? [],
      buy: result?.buy ?? [],
      free: result?.free ?? [],
      ads: result?.ads ?? [],
      hasData: !!result && !!((result.flatrate?.length || result.rent?.length || result.buy?.length || result.free?.length || result.ads?.length)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch providers";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
