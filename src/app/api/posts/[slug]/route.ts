import { PUBLIC_CACHE, jsonError, jsonOk } from "@/lib/api";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { toApiPostDetail, toApiPostSummary } from "@/lib/serializers";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts/[slug]
 * Tek bir haberin tüm alanları (Markdown gövde ve kaynak dâhil) ve ilgili haberler.
 * Bulunamazsa 404 + { success: false, error }.
 */
export async function GET(
  _request: Request,
  // Next.js 16'da dinamik segmentler Promise olarak gelir.
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return jsonError("NOT_FOUND", `'${slug}' adresli haber bulunamadı.`, 404);
    }

    const related = await getRelatedPosts(post.slug, post.category.slug, 3);

    return jsonOk(toApiPostDetail(post), { related: related.map(toApiPostSummary) }, PUBLIC_CACHE);
  } catch (error) {
    console.error("GET /api/posts/[slug]", error);
    return jsonError("INTERNAL_ERROR", "Haber getirilemedi.", 500);
  }
}
