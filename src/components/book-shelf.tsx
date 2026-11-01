import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { BookSummary } from "@/types/content";

const trDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

/** Kapak yoksa kitabın adından sırt rengi ve baş harfleri üretir; her kitap farklı görünür. */
const SPINE_PALETTE = [
  "from-[#8f4b2e] to-[#5e2f1c]",
  "from-[#2f4858] to-[#1b2b35]",
  "from-[#6b5b3e] to-[#3d3322]",
  "from-[#4a5d4a] to-[#2b3a2b]",
  "from-[#5b3a5e] to-[#352137]",
  "from-[#7a6a2f] to-[#4a4019]",
  "from-[#3b5a6b] to-[#203642]",
  "from-[#7a3b3b] to-[#4a2222]",
];

function spineFor(title: string): string {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SPINE_PALETTE[hash % SPINE_PALETTE.length];
}

function initials(title: string): string {
  const words = title
    .replace(/[.,:;!?'"()\-–—]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(ve|ile|bir|the|and|of|de|du|la|le|der|die|das|un|une|üzerine|için)$/i.test(w));
  return words.slice(0, 2).map((w) => w[0]?.toLocaleUpperCase("tr-TR") ?? "").join("");
}

/**
 * Kitap rafı — "Yeni Kitaplar" bölümünün üstünde, sitede tanıtılan her kitap için bir kutu.
 * Ters kronolojik: en üstte en yeni çıkanlar (yayın yılı, sonra tanıtım tarihi).
 * Kapak görseli olmayan kitaplar için adından türetilen bir "sırt" gösterilir.
 */
export function BookShelf({ books, title = "Raf" }: { books: BookSummary[]; title?: string }) {
  // Yıl gruplarıyla ayraç koymak için önceki yılı izle.
  let lastYear: number | null | undefined;

  return (
    <section aria-labelledby="kitap-rafi">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">{title}</p>
          <h2 id="kitap-rafi" className="mt-1 font-serif text-xl font-bold">
            Sitede tanıtılan kitaplar
          </h2>
        </div>
        <p className="text-xs text-muted">
          {books.length} kitap · en yeniden en eskiye
        </p>
      </div>

      <div className="mt-6 space-y-8">
        {books.map((book, index) => {
          const showYear = book.year !== lastYear;
          lastYear = book.year;
          return (
            <div key={book.id}>
              {showYear && (
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-serif text-2xl font-bold text-accent">{book.year ?? "Tarihsiz"}</span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </div>
              )}
              <ShelfCard book={book} priority={index < 4} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ShelfCard({ book, priority }: { book: BookSummary; priority: boolean }) {
  const meta = [book.publisher, book.language].filter(Boolean).join(" · ");
  const introduced = book.post?.publishedAt ? trDate.format(book.post.publishedAt) : null;

  return (
    <article className="grid gap-5 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent sm:grid-cols-[112px_minmax(0,1fr)]">
      {/* Kapak ya da sırt */}
      <div className="relative mx-auto h-40 w-28 shrink-0 overflow-hidden rounded-md border border-line shadow-sm sm:mx-0">
        {book.coverImage ? (
          <Image src={book.coverImage} alt="" fill sizes="112px" priority={priority} className="object-cover" />
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col justify-between bg-gradient-to-b p-2 text-paper",
              spineFor(book.title),
            )}
            aria-hidden
          >
            <span className="text-[9px] tracking-[0.2em] uppercase opacity-80">{book.year ?? ""}</span>
            <span className="font-serif text-3xl font-bold leading-none">{initials(book.title)}</span>
            <span className="line-clamp-3 text-[10px] leading-tight opacity-90">{book.title}</span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-wide text-muted uppercase">
          {book.year && <span className="font-semibold text-accent">{book.year}</span>}
          {meta && <span>{meta}</span>}
          {book.translator && <span>Çeviri: {book.translator}</span>}
        </div>

        <h3 className="mt-2 font-serif text-lg leading-snug font-bold">
          {book.post ? (
            <Link href={`/haber/${book.post.slug}`} className="hover:text-accent">
              {book.title}
            </Link>
          ) : (
            book.title
          )}
        </h3>

        {book.originalTitle && book.originalTitle !== book.title && (
          <p className="mt-1 text-sm text-muted italic">{book.originalTitle}</p>
        )}

        {book.philosopher && (
          <p className="mt-1.5 text-sm">
            <Link href={`/filozof/${book.philosopher.slug}`} className="text-accent hover:underline">
              {book.philosopher.name}
            </Link>
          </p>
        )}

        {book.description && (
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-soft">{book.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {book.post && (
            <Link href={`/haber/${book.post.slug}`} className="text-accent hover:underline">
              Tanıtım yazısı{introduced ? ` · ${introduced}` : ""} →
            </Link>
          )}
          {book.link && (
            <a href={book.link} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent hover:underline">
              Yayıncı / kitapçı sayfası ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
