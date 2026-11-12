import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { AwardsCalendar } from "@/components/awards-calendar";
import { BookShelf } from "@/components/book-shelf";
import { CategorySidebar } from "@/components/category-sidebar";
import { Container } from "@/components/container";
import { Pagination } from "@/components/pagination";
import { SectionHeading } from "@/components/section-heading";
import { getBooks, getCategories, getCategoryBySlug, getPosts, getTags } from "@/lib/queries";

// İçerik yalnızca yeni yayınla değişir ve her yayın ISR önbelleğini sıfırlar;
// bu yüzden sayfalar günde bir kez yenilenir (sunucu CPU kullanımını düşürür).
export const revalidate = 86400;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Bölüm bulunamadı" };

  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = Number.parseInt(page ?? "1", 10) || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // Bölüme özgü üst alanlar: Ödüller'de takvim, Yeni Kitaplar'da raf.
  const isAwards = slug === "oduller";
  const isBooks = slug === "yeni-kitaplar";

  const [{ items: posts, pagination }, categories, tags, books] = await Promise.all([
    getPosts({ page: currentPage, limit: 9, categorySlug: slug }),
    getCategories(),
    getTags(12),
    isBooks && currentPage === 1 ? getBooks() : Promise.resolve([]),
  ]);

  return (
    <Container size="wide">
      <header className="border-b border-line py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Kategori</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted metin-yasli">{category.description}</p>
        )}
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <section>
          {isAwards && currentPage === 1 && (
            <div className="mb-12">
              <AwardsCalendar />
            </div>
          )}

          {isBooks && currentPage === 1 && books.length > 0 && (
            <div className="mb-12">
              <BookShelf books={books} />
            </div>
          )}

          {(isAwards || isBooks) && (
            <div className="mb-6">
              <SectionHeading title={isAwards ? "Ödül Haberleri" : "Kitap Haberleri"} />
            </div>
          )}

          {posts.length === 0 ? (
            <p className="text-sm text-muted">Bu bölümde henüz haber yok.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination pagination={pagination} basePath={`/kategori/${slug}`} />
        </section>

        <CategorySidebar categories={categories} tags={tags} activeSlug={slug} />
      </div>
    </Container>
  );
}
