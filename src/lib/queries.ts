import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type {
  BookSummary,
  EventItem,
  CategoryWithCount,
  Paginated,
  PhilosopherDetail,
  PhilosopherWithCount,
  PostDetail,
  PostListItem,
  PostQueryOptions,
  TagSummary,
} from "@/types/content";

/** Varsayılan sayfa boyutu ve üst sınır (API'nin kötüye kullanılmasını engeller). */
export const DEFAULT_PAGE_SIZE = 9;
export const MAX_PAGE_SIZE = 50;

/* ------------------------------------------------------------------ */
/* Veri önbelleği                                                      */
/* ------------------------------------------------------------------ */

/**
 * Okuma sorguları 10 dakika önbelleğe alınır.
 *
 * Neden: Sitenin her sayfası her ziyarette veritabanına gidiyordu; bot ve
 * tarayıcı trafiği hem Vercel'in işlemci kotasını hem Neon'un compute kotasını
 * tüketiyordu (Eylül 2026'da ikisi de sınıra dayandı). Aynı sorgu aynı
 * parametrelerle 10 dakika içinde tekrar gelirse veritabanına gidilmez.
 *
 * Yeni içerik nasıl görünür? Vercel'in veri önbelleği yayınlar (deploy) arasında
 * da yaşar; bu yüzden anahtara yayının commit kimliğini ekliyoruz: her yeni
 * yayın temiz bir önbellekle başlar ve yeni haberler hemen görünür. Yayın
 * yapılmadan eklenen içerik ise en geç 10 dakika içinde görünür.
 *
 * Not: Önbellek JSON'a çevirerek saklar, Date alanları metne döner. Aşağıdaki
 * `reviveDates` bilinen tarih alanlarını geri Date yapar; bileşenler ve API
 * serileştiricileri `toISOString()` çağırdığı için bu gerekli.
 */
const CACHE_SECONDS = 600;

/** Yayın kimliği: Vercel her derlemede commit SHA'sını verir; yerelde sabit. */
const DEPLOY_ID = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? "local";

const DATE_KEYS = new Set([
  "publishedAt",
  "updatedAt",
  "createdAt",
  "startsAt",
  "endsAt",
  "deadline",
  "cfpDeadline",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function reviveDates<T>(value: T): T {
  // Önbellek boşken (ilk istek) veri JSON'dan değil doğrudan Prisma'dan gelir;
  // Date nesneleri zaten Date'tir, dokunulmadan geçmeli. (Aksi hâlde aşağıdaki
  // nesne dalı Date'i boş bir nesneye çevirir ve tarih biçimlendirme patlar.)
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_KEYS.has(key) && typeof item === "string" && ISO_DATE.test(item)) {
        out[key] = new Date(item);
      } else {
        out[key] = reviveDates(item);
      }
    }
    return out as T;
  }
  return value;
}

/** Bir okuma fonksiyonunu önbellekli sürümüyle sarar; anahtar, ad + argümanlardan üretilir. */
function cached<A extends unknown[], R>(
  name: string,
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  const inner = unstable_cache(fn, ["queries", DEPLOY_ID, name], {
    revalidate: CACHE_SECONDS,
    tags: ["content"],
  });
  return async (...args: A) => reviveDates(await inner(...args));
}

/** Yalnızca yayımlanmış haberler: publishedAt dolu ve geçmişte. */
const publishedFilter = () => ({
  publishedAt: { not: null, lte: new Date() },
});

/** Kart/liste görünümleri için ortak select — gövde (content) çekilmez. */
const listSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImage: true,
  featured: true,
  publishedAt: true,
  author: { select: { id: true, name: true, slug: true, avatar: true, bio: true } },
  category: { select: { id: true, name: true, slug: true, description: true } },
  tags: { select: { id: true, name: true, slug: true } },
  philosophers: {
    select: { id: true, name: true, slug: true, headline: true, avatar: true, country: true, affiliation: true },
  },
} as const;

const bookSelect = {
  id: true,
  title: true,
  slug: true,
  originalTitle: true,
  publisher: true,
  translator: true,
  language: true,
  coverImage: true,
  description: true,
  year: true,
  link: true,
  philosopher: { select: { id: true, name: true, slug: true } },
} as const;

/**
 * Sayfalanmış haber listesi. Kategori, etiket, filozof, editör ve arama filtrelerini destekler.
 * Hem site sayfaları hem de `/api/posts` bu fonksiyonu kullanır.
 */
async function getPostsRaw(options: PostQueryOptions = {}): Promise<Paginated<PostListItem>> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(options.limit ?? DEFAULT_PAGE_SIZE)));

  const where = {
    ...publishedFilter(),
    ...(options.categorySlug ? { category: { slug: options.categorySlug } } : {}),
    ...(options.tagSlug ? { tags: { some: { slug: options.tagSlug } } } : {}),
    ...(options.philosopherSlug ? { philosophers: { some: { slug: options.philosopherSlug } } } : {}),
    ...(options.authorSlug ? { author: { slug: options.authorSlug } } : {}),
    ...(options.excludeSlug ? { slug: { not: options.excludeSlug } } : {}),
    ...(options.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" as const } },
            { summary: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: listSelect,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
export const getPosts = cached("getPosts", getPostsRaw);

/**
 * Manşet slider'ındaki haberler.
 * Öne çıkarılmış haberler yeterli değilse en yeni haberlerle tamamlanır,
 * böylece slider hiçbir zaman boş kalmaz.
 */
async function getFeaturedPostsRaw(take = 5): Promise<PostListItem[]> {
  const featured = await prisma.post.findMany({
    where: { ...publishedFilter(), featured: true },
    select: listSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });

  if (featured.length >= take) return featured;

  const fillers = await prisma.post.findMany({
    where: { ...publishedFilter(), featured: false },
    select: listSelect,
    orderBy: { publishedAt: "desc" },
    take: take - featured.length,
  });

  return [...featured, ...fillers];
}
export const getFeaturedPosts = cached("getFeaturedPosts", getFeaturedPostsRaw);

/** Ana sayfa manşeti. featured yoksa en yeni habere düşer. */
async function getFeaturedPostRaw(): Promise<PostListItem | null> {
  const featured = await prisma.post.findFirst({
    where: { ...publishedFilter(), featured: true },
    select: listSelect,
    orderBy: { publishedAt: "desc" },
  });

  if (featured) return featured;

  return prisma.post.findFirst({
    where: publishedFilter(),
    select: listSelect,
    orderBy: { publishedAt: "desc" },
  });
}
export const getFeaturedPost = cached("getFeaturedPost", getFeaturedPostRaw);

/** Tek haber (Markdown gövdesiyle). Bulunamazsa null döner. */
async function getPostBySlugRaw(slug: string): Promise<PostDetail | null> {
  return prisma.post.findFirst({
    where: { slug, ...publishedFilter() },
    select: {
      ...listSelect,
      content: true,
      seoTitle: true,
      metaDescription: true,
      contentType: true,
      imageCredit: true,
      sourceName: true,
      sourceUrl: true,
      updatedAt: true,
      sources: {
        orderBy: [{ primary: "desc" }, { order: "asc" }],
        select: { id: true, title: true, publisher: true, date: true, url: true, primary: true },
      },
    },
  });
}
export const getPostBySlug = cached("getPostBySlug", getPostBySlugRaw);

/** Aynı kategoriden, o haber hariç en yeni birkaç haber. */
async function getRelatedPostsRaw(slug: string, categorySlug: string, take = 3): Promise<PostListItem[]> {
  return prisma.post.findMany({
    where: { ...publishedFilter(), slug: { not: slug }, category: { slug: categorySlug } },
    select: listSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
}
export const getRelatedPosts = cached("getRelatedPosts", getRelatedPostsRaw);

/** Tüm kategoriler + yayımlanmış haber sayıları (navigasyon ve /api/categories). */
async function getCategoriesRaw(): Promise<CategoryWithCount[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { posts: { where: publishedFilter() } } },
    },
  });

  return rows.map(({ _count, ...category }) => ({ ...category, postCount: _count.posts }));
}
export const getCategories = cached("getCategories", getCategoriesRaw);

async function getCategoryBySlugRaw(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, description: true },
  });
}
export const getCategoryBySlug = cached("getCategoryBySlug", getCategoryBySlugRaw);

/** Etiket bulutu için en çok kullanılan etiketler. */
async function getTagsRaw(take = 24): Promise<TagSummary[]> {
  return prisma.tag.findMany({
    orderBy: { posts: { _count: "desc" } },
    select: { id: true, name: true, slug: true },
    take,
  });
}
export const getTags = cached("getTags", getTagsRaw);

async function getTagBySlugRaw(slug: string) {
  return prisma.tag.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } });
}
export const getTagBySlug = cached("getTagBySlug", getTagBySlugRaw);

/* ------------------------------------------------------------------ */
/* Filozoflar                                                          */
/* ------------------------------------------------------------------ */

const philosopherSelect = {
  id: true,
  name: true,
  slug: true,
  headline: true,
  avatar: true,
  country: true,
  affiliation: true,
} as const;

/** Filozof listesi; `onlyFeatured` ana sayfadaki şerit için kullanılır. */
async function getPhilosophersRaw(
  options: { onlyFeatured?: boolean; take?: number } = {},
): Promise<PhilosopherWithCount[]> {
  const rows = await prisma.philosopher.findMany({
    // Onay listesi: yalnızca `listed = true` olan isimler dizine ve şeride girer.
    where: { listed: true, ...(options.onlyFeatured ? { featured: true } : {}) },
    orderBy: { name: "asc" },
    take: options.take,
    select: {
      ...philosopherSelect,
      _count: { select: { posts: { where: publishedFilter() } } },
    },
  });

  return rows.map(({ _count, ...philosopher }) => ({ ...philosopher, postCount: _count.posts }));
}
export const getPhilosophers = cached("getPhilosophers", getPhilosophersRaw);

async function getPhilosopherBySlugRaw(slug: string): Promise<PhilosopherDetail | null> {
  return prisma.philosopher.findUnique({
    where: { slug },
    select: {
      ...philosopherSelect,
      bio: true,
      birthYear: true,
      website: true,
      featured: true,
      listed: true,
      fullName: true,
      birthDate: true,
      deathDate: true,
      alive: true,
      period: true,
      school: true,
      areas: true,
      majorWorks: true,
      keyConcepts: true,
      influencedBy: true,
      influenced: true,
      longBio: true,
      sources: true,
    },
  });
}
export const getPhilosopherBySlug = cached("getPhilosopherBySlug", getPhilosopherBySlugRaw);

/** Bir filozofun kitapları (profil sayfası). */
async function getBooksByPhilosopherRaw(slug: string): Promise<BookSummary[]> {
  return prisma.book.findMany({
    where: { philosopher: { slug } },
    orderBy: [{ year: "desc" }, { title: "asc" }],
    select: bookSelect,
  });
}
export const getBooksByPhilosopher = cached("getBooksByPhilosopher", getBooksByPhilosopherRaw);

/* ------------------------------------------------------------------ */
/* Kitaplar                                                            */
/* ------------------------------------------------------------------ */

async function getBooksRaw(take?: number): Promise<BookSummary[]> {
  return prisma.book.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    take,
    select: bookSelect,
  });
}
export const getBooks = cached("getBooks", getBooksRaw);

/* ------------------------------------------------------------------ */
/* Etkinlikler (Konferanslar)                                          */
/* ------------------------------------------------------------------ */

const eventSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  description: true,
  kind: true,
  speakers: true,
  organizer: true,
  topic: true,
  format: true,
  startsAt: true,
  endsAt: true,
  timezone: true,
  hasTime: true,
  city: true,
  country: true,
  venue: true,
  registrationUrl: true,
  fee: true,
  deadline: true,
  cfpDeadline: true,
  website: true,
  sourceName: true,
  sourceUrl: true,
  coverImage: true,
  featured: true,
} as const;

/** Yalnızca yayımlanmış etkinlikler. */
const publishedEventFilter = () => ({ publishedAt: { not: null, lte: new Date() } });

/**
 * Yaklaşan etkinlikler — bugünü de kapsar.
 * Çok günlü etkinliklerde bitiş tarihi geçmediyse etkinlik hâlâ "yaklaşan" sayılır.
 */
async function getUpcomingEventsRaw(take?: number): Promise<EventItem[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.event.findMany({
    where: {
      ...publishedEventFilter(),
      OR: [{ endsAt: { gte: today } }, { endsAt: null, startsAt: { gte: today } }],
    },
    orderBy: { startsAt: "asc" },
    take,
    select: eventSelect,
  });
}
export const getUpcomingEvents = cached("getUpcomingEvents", getUpcomingEventsRaw);

/** Geçmiş etkinlikler — arşiv olarak listelenir, silinmez. */
async function getPastEventsRaw(take = 20): Promise<EventItem[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.event.findMany({
    where: {
      ...publishedEventFilter(),
      OR: [{ endsAt: { lt: today } }, { endsAt: null, startsAt: { lt: today } }],
    },
    orderBy: { startsAt: "desc" },
    take,
    select: eventSelect,
  });
}
export const getPastEvents = cached("getPastEvents", getPastEventsRaw);

async function getEventBySlugRaw(slug: string): Promise<EventItem | null> {
  return prisma.event.findFirst({
    where: { slug, ...publishedEventFilter() },
    select: eventSelect,
  });
}
export const getEventBySlug = cached("getEventBySlug", getEventBySlugRaw);

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

/** sitemap için tüm yayımlanmış slug'lar. */
async function getAllPostSlugsRaw(): Promise<string[]> {
  const rows = await prisma.post.findMany({ where: publishedFilter(), select: { slug: true } });
  return rows.map((row) => row.slug);
}
export const getAllPostSlugs = cached("getAllPostSlugs", getAllPostSlugsRaw);

async function getAllPhilosopherSlugsRaw(): Promise<string[]> {
  // Site haritasına yalnızca onaylı filozoflar girer.
  const rows = await prisma.philosopher.findMany({ where: { listed: true }, select: { slug: true } });
  return rows.map((row) => row.slug);
}
export const getAllPhilosopherSlugs = cached("getAllPhilosopherSlugs", getAllPhilosopherSlugsRaw);
