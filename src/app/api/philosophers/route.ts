import type { NextRequest } from "next/server";

import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getPhilosophers } from "@/lib/queries";
import { toApiPhilosopherWithCount } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/philosophers
 * Takip edilen filozoflar ve her birinin haber sayısı.
 * ?featured=true yalnızca ana sayfada öne çıkarılanları döner.
 */
export async function GET(request: NextRequest) {
  try {
    const onlyFeatured = request.nextUrl.searchParams.get("featured") === "true";
    const philosophers = await getPhilosophers({ onlyFeatured });

    return jsonOk(
      philosophers.map(toApiPhilosopherWithCount),
      { count: philosophers.length },
      PUBLIC_CACHE,
    );
  } catch (error) {
    console.error("GET /api/philosophers", error);
    return jsonError("INTERNAL_ERROR", "Filozoflar getirilemedi.", 500);
  }
}
