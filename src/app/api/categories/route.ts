import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getCategories } from "@/lib/queries";
import { toApiCategory } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Tüm kategoriler, menü sırasına göre ve yayımlanmış yazı sayılarıyla birlikte.
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return jsonOk(categories.map(toApiCategory), { count: categories.length }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/categories", error);
    return jsonError("INTERNAL_ERROR", "Bölümler getirilemedi.", 500);
  }
}
