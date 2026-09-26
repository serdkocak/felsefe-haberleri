import type { NextRequest } from "next/server";

import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { toApiEvent } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/events
 * ?scope=upcoming (varsayılan) | past | all
 *
 * Mobil uygulamanın etkinlik takvimi ekranı bu ucu kullanır.
 */
export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get("scope") ?? "upcoming";

    if (scope === "past") {
      const past = await getPastEvents(50);
      return jsonOk(past.map(toApiEvent), { scope, count: past.length }, PUBLIC_CACHE);
    }

    if (scope === "all") {
      const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents(50)]);
      return jsonOk(
        [...upcoming, ...past].map(toApiEvent),
        { scope, upcoming: upcoming.length, past: past.length },
        PUBLIC_CACHE,
      );
    }

    const upcoming = await getUpcomingEvents();
    return jsonOk(upcoming.map(toApiEvent), { scope: "upcoming", count: upcoming.length }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/events", error);
    return jsonError("INTERNAL_ERROR", "Etkinlikler getirilemedi.", 500);
  }
}
