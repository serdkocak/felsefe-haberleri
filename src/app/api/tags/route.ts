import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getTags } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** GET /api/tags — etiket bulutu / mobil filtre ekranı için. */
export async function GET() {
  try {
    const tags = await getTags(50);
    return jsonOk(tags, { count: tags.length }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/tags", error);
    return jsonError("INTERNAL_ERROR", "Etiketler getirilemedi.", 500);
  }
}
