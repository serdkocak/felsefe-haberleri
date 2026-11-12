import { NextResponse } from "next/server";

import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  clean,
  hashIp,
  isHoneypotFilled,
  isValidEmail,
  looksLikeSpam,
  normalizeEmail,
  rateLimit,
} from "@/lib/security";

export const dynamic = "force-dynamic";

/** Yorumlar varsayılan olarak anında yayımlanır; moderasyon istenirse .env ile kapatılır. */
const autoApprove = process.env.COMMENT_AUTO_APPROVE !== "false";

const MAX_BODY = 2000;
const MIN_BODY = 3;

type CommentRow = {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: Date;
  parentId: string | null;
};

function toApiComment(comment: CommentRow) {
  return {
    id: comment.id,
    // E-posta hiçbir zaman dışarı verilmez.
    authorName: comment.authorName?.trim() || "Anonim",
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    parentId: comment.parentId,
  };
}

/**
 * GET /api/posts/[slug]/comments
 * Habere ait onaylı yorumlar (eskiden yeniye).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return jsonError("NOT_FOUND", "Haber bulunamadı.", 404);

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
      select: { id: true, authorName: true, body: true, createdAt: true, parentId: true },
    });

    // Yorum listesi CDN'de kısa süre önbelleklenir; her sayfa görüntülemesi sunucuyu çalıştırmaz.
    return jsonOk(comments.map(toApiComment), { count: comments.length }, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("GET /api/posts/[slug]/comments", error);
    return jsonError("INTERNAL_ERROR", "Yorumlar getirilemedi.", 500);
  }
}

/**
 * POST /api/posts/[slug]/comments
 * Gövde: { body, authorName?, email?, parentId?, website? }
 *   - `authorName` boşsa yorum "Anonim" olarak yayımlanır (üyelik gerekmez).
 *   - `website` gizli tuzak alandır; doluysa istek sessizce yutulur.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ipHash = hashIp(request);

    // Aynı ziyaretçiden 10 dakikada en fazla 5 yorum.
    if (!rateLimit(`comment:${ipHash ?? "anon"}`, 5, 10 * 60 * 1000)) {
      return jsonError("RATE_LIMITED", "Çok sık yorum gönderdiniz. Birkaç dakika sonra deneyin.", 429);
    }

    const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!payload) return jsonError("BAD_REQUEST", "Geçersiz istek gövdesi.", 400);

    // Tuzak alan: bot doldurmuşsa başarılı gibi davran, kaydetme.
    if (isHoneypotFilled(payload.website)) {
      return NextResponse.json({ success: true, data: null, meta: { skipped: true } });
    }

    const body = clean(payload.body, MAX_BODY);
    const authorName = clean(payload.authorName, 60);
    const emailRaw = clean(payload.email, 254);
    const parentId = clean(payload.parentId, 40) || null;

    if (body.length < MIN_BODY) {
      return jsonError("VALIDATION", "Yorum çok kısa.", 422);
    }

    if (emailRaw && !isValidEmail(normalizeEmail(emailRaw))) {
      return jsonError("VALIDATION", "E-posta adresi geçersiz görünüyor.", 422);
    }

    if (looksLikeSpam(body)) {
      return jsonError("SPAM", "Yorum otomatik denetimden geçemedi. Bağlantı sayısını azaltmayı deneyin.", 422);
    }

    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return jsonError("NOT_FOUND", "Haber bulunamadı.", 404);

    // Yanıt verilen yorum gerçekten bu habere mi ait?
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { postId: true } });
      if (!parent || parent.postId !== post.id) {
        return jsonError("VALIDATION", "Yanıtlanan yorum bulunamadı.", 422);
      }
    }

    const created = await prisma.comment.create({
      data: {
        postId: post.id,
        authorName: authorName || null,
        authorEmail: emailRaw ? normalizeEmail(emailRaw) : null,
        body,
        parentId,
        status: autoApprove ? "APPROVED" : "PENDING",
        ipHash,
        userAgent: clean(request.headers.get("user-agent"), 200) || null,
      },
      select: { id: true, authorName: true, body: true, createdAt: true, parentId: true, status: true },
    });

    return jsonOk(created.status === "APPROVED" ? toApiComment(created) : null, {
      status: created.status,
      message:
        created.status === "APPROVED"
          ? "Yorumunuz yayımlandı."
          : "Yorumunuz alındı, onaydan sonra yayımlanacak.",
    });
  } catch (error) {
    console.error("POST /api/posts/[slug]/comments", error);
    return jsonError("INTERNAL_ERROR", "Yorum kaydedilemedi.", 500);
  }
}
