import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getBooks } from "@/lib/queries";
import { toApiBook } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/** GET /api/books — yeni çıkan kitaplar bölümü. */
export async function GET() {
  try {
    const books = await getBooks();
    return jsonOk(books.map(toApiBook), { count: books.length }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/books", error);
    return jsonError("INTERNAL_ERROR", "Kitaplar getirilemedi.", 500);
  }
}
