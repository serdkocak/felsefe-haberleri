import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getBooksByPhilosopher, getPhilosopherBySlug, getPosts } from "@/lib/queries";
import { toApiBook, toApiPhilosopherDetail, toApiPostSummary } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/philosophers/[slug]
 * Filozofun profili + son haberleri + kitapları.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const philosopher = await getPhilosopherBySlug(slug);

    if (!philosopher) {
      return jsonError("NOT_FOUND", `'${slug}' adresli filozof bulunamadı.`, 404);
    }

    const [{ items: posts, pagination }, books] = await Promise.all([
      getPosts({ philosopherSlug: slug, limit: 20 }),
      getBooksByPhilosopher(slug),
    ]);

    return jsonOk(
      toApiPhilosopherDetail(philosopher, pagination.total),
      {
        posts: posts.map(toApiPostSummary),
        books: books.map(toApiBook),
      },
      PUBLIC_CACHE,
    );
  } catch (error) {
    console.error("GET /api/philosophers/[slug]", error);
    return jsonError("INTERNAL_ERROR", "Filozof getirilemedi.", 500);
  }
}
