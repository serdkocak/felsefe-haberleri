import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { BookCard } from "@/components/book-card";
import { Container } from "@/components/container";
import { CoverImage } from "@/components/cover-image";
import { EventCard } from "@/components/event-card";
import { HeadlineSlider } from "@/components/headline-slider";
import { Pagination } from "@/components/pagination";
import { PhilosopherAvatar } from "@/components/philosopher-card";
import { SectionHeading } from "@/components/section-heading";
import { SubscribeForm } from "@/components/subscribe-form";
import { TagPill } from "@/components/tag-pill";
import {
  getBooks,
  getCategories,
  getFeaturedPosts,
  getPhilosophers,
  getPosts,
  getTags,
  getUpcomingEvents,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

// İçerik 10 dakikalık aralıklarla tazelenir; sorgular lib/queries.ts'te önbellekli.
export const revalidate = 600;

export default async function HomePage({
  searchParams,
}: {
  // Next.js 16: searchParams bir Promise'tir.
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number.parseInt(page ?? "1", 10) || 1;
  const firstPage = currentPage === 1;

  const headlines = firstPage ? await getFeaturedPosts(5) : [];
  const headlineSlugs = headlines.map((post) => post.slug);

  const [{ items: posts, pagination }, categories, tags, philosophers, books, events] =
    await Promise.all([
      getPosts({ page: currentPage, limit: 8 }),
      getCategories(),
      getTags(14),
      getPhilosophers({ onlyFeatured: true, take: 5 }),
      getBooks(3),
      getUpcomingEvents(3),
    ]);

  // Manşetteki haberleri listede tekrar göstermeyelim.
  const listed = firstPage ? posts.filter((post) => !headlineSlugs.includes(post.slug)) : posts;
  const [lead, ...rest] = listed;

  return (
    <>
      {firstPage && <HeadlineSlider posts={headlines} />}

      <Container size="wide" className="pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-14">
          {/* ---------------- Ana sütun ---------------- */}
          <section>
            <SectionHeading title="Son Haberler" note={`${pagination.total} haber`} />

            {listed.length === 0 ? (
              <p className="mt-10 text-sm text-muted">
                Henüz yayımlanmış haber yok. Veritabanını tohumlamak için{" "}
                <code className="rounded bg-accent-soft px-1.5 py-0.5">npm run db:seed</code> komutunu
                çalıştırın.
              </p>
            ) : (
              <>
                {/* Sütun başı haberi — gazetedeki gibi geniş */}
                {lead && (
                  <article className="group grid gap-6 border-b border-line py-8 sm:grid-cols-[1fr_240px]">
                    <div>
                      <Link
                        href={`/kategori/${lead.category.slug}`}
                        className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase"
                      >
                        {lead.category.name}
                      </Link>

                      <h3 className="mt-2 font-serif text-2xl leading-tight font-bold text-balance sm:text-[1.7rem]">
                        <Link href={`/haber/${lead.slug}`} className="transition-colors group-hover:text-accent">
                          {lead.title}
                        </Link>
                      </h3>

                      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft metin-yasli">{lead.summary}</p>

                      <p className="mt-4 text-xs text-muted">
                        {lead.author.name} · {formatDate(lead.publishedAt)}
                        {lead.philosophers.length > 0 &&
                          ` · ${lead.philosophers.map((philosopher) => philosopher.name).join(", ")}`}
                      </p>
                    </div>

                    {lead.coverImage && (
                      <Link
                        href={`/haber/${lead.slug}`}
                        className="relative block aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface sm:aspect-auto sm:h-40"
                      >
                        <CoverImage
                          src={lead.coverImage}
                          sizes="240px"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    )}
                  </article>
                )}

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {rest.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}

            <Pagination pagination={pagination} basePath="/" />

            {/* Yaklaşan konferanslar */}
            {firstPage && events.length > 0 && (
              <div className="mt-16">
                <SectionHeading title="Yaklaşan Konferanslar" href="/konferanslar" />
                <div className="mt-6 grid gap-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Yeni kitaplar */}
            {firstPage && books.length > 0 && (
              <div className="mt-16">
                <SectionHeading title="Yeni Kitaplar" href="/kitaplar" />
                <div className="mt-6 grid gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ---------------- Kenar sütunu ---------------- */}
          <aside className="space-y-10">
            <SubscribeForm />

            {philosophers.length > 0 && (
              <div>
                <SectionHeading title="Takipteki Filozoflar" href="/filozoflar" />
                <ul className="mt-4 divide-y divide-line">
                  {philosophers.map((philosopher) => (
                    <li key={philosopher.id}>
                      <Link
                        href={`/filozof/${philosopher.slug}`}
                        className="group flex items-center gap-3 py-3"
                      >
                        <PhilosopherAvatar philosopher={philosopher} size={40} />
                        <span className="min-w-0">
                          <span className="block truncate font-serif text-sm font-bold transition-colors group-hover:text-accent">
                            {philosopher.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {philosopher.postCount} haber
                            {philosopher.country ? ` · ${philosopher.country}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <SectionHeading title="Bölümler" />
              <ul className="mt-4 space-y-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                    >
                      {category.name}
                      <span className="text-xs text-muted">{category.postCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {tags.length > 0 && (
              <div>
                <SectionHeading title="Etiketler" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
