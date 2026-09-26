import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { CategorySidebar } from "@/components/category-sidebar";
import { Container } from "@/components/container";
import { Pagination } from "@/components/pagination";
import { getCategories, getPosts, getTagBySlug, getTags } from "@/lib/queries";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return { title: tag ? `${tag.name} etiketi` : "Etiket bulunamadı" };
}

export default async function TagPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const currentPage = Number.parseInt(page ?? "1", 10) || 1;

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const [{ items: posts, pagination }, categories, tags] = await Promise.all([
    getPosts({ page: currentPage, limit: 9, tagSlug: slug }),
    getCategories(),
    getTags(12),
  ]);

  return (
    <Container size="wide">
      <header className="border-b border-line py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Etiket</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{tag.name}</h1>
        <p className="mt-4 text-sm text-muted">{pagination.total} haber</p>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <section>
          {posts.length === 0 ? (
            <p className="text-sm text-muted">Bu etiketle henüz haber yok.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination pagination={pagination} basePath={`/etiket/${slug}`} />
        </section>

        <CategorySidebar categories={categories} tags={tags} />
      </div>
    </Container>
  );
}
