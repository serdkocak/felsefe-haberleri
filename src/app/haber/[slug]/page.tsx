import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { Comments } from "@/components/comments";
import { Container } from "@/components/container";
import { CoverImage } from "@/components/cover-image";
import { ShareButtons } from "@/components/share-buttons";
import { Markdown } from "@/components/markdown";
import { PhilosopherAvatar } from "@/components/philosopher-card";
import { SourceNote } from "@/components/source-note";
import { SubscribeForm } from "@/components/subscribe-form";
import { TagPill } from "@/components/tag-pill";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { formatDate, readingTime } from "@/lib/utils";

// Sayfa 10 dakika önbellekte kalır (ISR); veri katmanı da ayrıca önbellekli.
export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Haber bulunamadı" };

  return {
    // SEO alanları doldurulmuşsa onlar, değilse başlık ve özet kullanılır.
    title: post.seoTitle ?? post.title,
    description: post.metaDescription ?? post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category.slug, 3);

  return (
    <article className="pb-16">
      <Container size="reading" className="pt-12 sm:pt-16">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
          <Link
            href={`/kategori/${post.category.slug}`}
            className="font-semibold tracking-[0.2em] text-accent uppercase"
          >
            {post.category.name}
          </Link>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{readingTime(post.content)} dk okuma</span>
        </div>

        <h1 className="mt-5 font-serif text-3xl leading-tight font-bold text-balance sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-5 font-serif text-lg leading-relaxed text-muted metin-yasli">{post.summary}</p>

        {post.philosophers.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {post.philosophers.map((philosopher) => (
              <Link
                key={philosopher.id}
                href={`/filozof/${philosopher.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                <PhilosopherAvatar philosopher={philosopher} size={24} />
                {philosopher.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-3 border-y border-line py-5">
          {post.author.avatar && (
            <Image
              src={post.author.avatar}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            {post.author.bio && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{post.author.bio}</p>}
          </div>
        </div>
      </Container>

      {post.coverImage && (
        <Container size="default" className="mt-10">
          <figure>
            {/*
              KAPAK ÇERÇEVESİ
              Kapak 16:9 değilse (örneğin dikey bir portre fotoğrafı) görseli kırpmıyoruz;
              tamamını gösterip arkasını kendi bulanık kopyasıyla dolduruyoruz. Böylece
              hiçbir yüz yarıda kesilmez. Zaten 16:9 olan kapaklarda bulanık katman
              görünmez, çerçeveyi görsel tam doldurur.
            */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface">
              <CoverImage src={post.coverImage} sizes="100vw" priority />
            </div>
            {post.imageCredit && (
              <figcaption className="mt-2 text-xs text-muted">{post.imageCredit}</figcaption>
            )}
          </figure>
        </Container>
      )}

      <Container size="reading" className="mt-12">
        <Markdown content={post.content} />

        <SourceNote name={post.sourceName} url={post.sourceUrl} sources={post.sources} />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-8">
            {post.tags.map((tag) => (
              <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}

        {/* Sosyal medya paylaşımı */}
        <ShareButtons title={post.title} />

        {/* Okur yorumları — üyelik gerekmez, anonim yazılabilir. */}
        <Comments slug={post.slug} />

        <div className="mt-14">
          <SubscribeForm />
        </div>
      </Container>

      {related.length > 0 && (
        <Container size="wide" className="mt-20">
          <h2 className="font-serif text-2xl font-bold">İlgili Haberler</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} post={item} />
            ))}
          </div>
        </Container>
      )}
    </article>
  );
}
