import type { NextRequest } from "next/server";

import { PUBLIC_CACHE, jsonError, jsonOk, readInt } from "@/lib/api";
import { DEFAULT_PAGE_SIZE, getPosts } from "@/lib/queries";
import { toApiPostSummary } from "@/lib/serializers";

// Veri her istekte tazedir; derleme anında statikleştirilmez.
export const dynamic = "force-dynamic";

/**
 * GET /api/posts
 *
 * Query parametreleri:
 *   page         (varsayılan 1)
 *   limit        (varsayılan 9, en fazla 50)
 *   category     kategori slug'ı    — ör. ?category=gundem
 *   tag          etiket slug'ı      — ör. ?tag=yapay-zeka
 *   philosopher  filozof slug'ı     — ör. ?philosopher=michael-sandel
 *   author       editör slug'ı
 *   q            başlık/özet araması
 *
 * Yanıt: { success, data: ApiPostSummary[], meta: { pagination } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const { items, pagination } = await getPosts({
      page: readInt(searchParams.get("page"), 1),
      limit: readInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE),
      categorySlug: searchParams.get("category") ?? undefined,
      tagSlug: searchParams.get("tag") ?? undefined,
      philosopherSlug: searchParams.get("philosopher") ?? undefined,
      authorSlug: searchParams.get("author") ?? undefined,
      search: searchParams.get("q") ?? undefined,
    });

    return jsonOk(items.map(toApiPostSummary), { pagination }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/posts", error);
    return jsonError("INTERNAL_ERROR", "Haberler getirilemedi.", 500);
  }
}
