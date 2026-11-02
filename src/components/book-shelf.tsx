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

/** "Yeni" sayılacak azami yaş (yıl). Ölçüt ilk baskının yılıdır, eldeki baskının değil. */
const NEW_WINDOW_YEARS = 3;

type GroupKey = "international" | "domestic" | "translation" | "classic";

const GROUPS: { key: GroupKey; title: string; blurb: string }[] = [
  { key: "international", title: "Yeni Çıkan Uluslararası Felsefe Kitapları", blurb: "Son üç yılda yabancı dillerde yayımlanan kitaplar." },
  { key: "domestic", title: "Yeni Çıkan Yerli Felsefe Kitapları", blurb: "Son üç yılda Türkçe yazılmış telif kitaplar." },
  { key: "translation", title: "Yeni Çıkan Çeviri Felsefe Kitapları", blurb: "Aslı son üç yılda yayımlanmış ve Türkçeye çevrilmiş kitaplar." },
  { key: "classic", title: "Önemli Felsefe Kitapları", blurb: "İlk baskısı üç yıldan eski olan temel eserler, yeni baskı ve çeviriler." },
];

/** Sıralama ve yaş hesabında esas alınan yıl: ilk baskı, yoksa eldeki baskı. */
function originYear(book: BookSummary): number | null {
  return book.originalYear ?? book.year ?? null;
}

function isTurkish(book: BookSummary): boolean {
  return (book.language ?? "").toLocaleLowerCase("tr-TR").startsWith("türk");
}

function isTranslation(book: BookSummary): boolean {
  if (book.translator) return true;
  return Boolean(book.originalTitle && book.originalTitle.trim() !== book.title.trim());
}

function groupOf(book: BookSummary, thisYear: number): GroupKey {
  const y = originYear(book);
  if (y === null || y < thisYear - NEW_WINDOW_YEARS) return "classic";
  if (!isTurkish(book)) return "international";
  return isTranslation(book) ? "translation" : "domestic";
}

function byRecency(a: BookSummary, b: BookSummary): number {
  const ya = originYear(a) ?? -1;
  const yb = originYear(b) ?? -1;
  if (yb !== ya) return yb - ya;
  const pa = a.post?.publishedAt?.getTime() ?? 0;
  const pb = b.post?.publishedAt?.getTime() ?? 0;
  return pb - pa;
}

/**
 * Kitap rafı — "Felsefe Kitapları" bölümünün üstünde, sitede tanıtılan her kitap için bir kutu.
 * Dört grup: yeni uluslararası, yeni yerli, yeni çeviri, önemli (klasik). Her grup ters kronolojik;
 * ölçüt kitabın ilk baskı yılıdır. Kapağı olmayan kitaplara adından türetilen bir "sırt" gösterilir.
 */
export function BookShelf({ books, title = "Raf", now = new Date() }: { books: BookSummary[]; title?: string; now?: Date }) {
  const thisYear = now.getFullYear();
  const grouped = new Map<GroupKey, BookSummary[]>();
  for (const book of books) {
    const key = groupOf(book, thisYear);
    grouped.set(key, [...(grouped.get(key) ?? []), book]);
  }

  return (
    <section aria-labelledby="kitap-rafi">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">{title}</p>
          <h2 id="kitap-rafi" className="mt-1 font-serif text-xl font-bold">
            Sitede tanıtılan kitaplar
          </h2>
        </div>
        <p className="text-xs text-muted">{books.length} kitap · her grupta en yeniden en eskiye</p>
      </div>

      {/* Grup içi bağlantılar */}
      <nav aria-label="Kitap grupları" className="mt-4 flex flex-wrap gap-2 text-xs">
        {GROUPS.map((g) => {
          const n = grouped.get(g.key)?.length ?? 0;
          if (n === 0) return null;
          return (
            <a key={g.key} href={`#raf-${g.key}`} className="rounded-full border border-line px-3 py-1 text-ink-soft hover:border-accent hover:text-accent">
              {g.title} <span className="text-muted">({n})</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-8 space-y-14">
        {GROUPS.map((g, gi) => {
          const items = (grouped.get(g.key) ?? []).sort(byRecency);
          if (items.length === 0) return null;
          let lastYear: number | null | undefined;
          return (
            <div key={g.key} id={`raf-${g.key}`} className="scroll-mt-24">
              <div className="flex items-baseline gap-3 border-b border-line pb-2">
                <span className="font-serif text-sm font-bold text-accent">{gi + 1}</span>
                <h3 className="font-serif text-lg font-bold">{g.title}</h3>
                <span className="ml-auto text-xs text-muted">{items.length} kitap</span>
              </div>
              <p className="mt-1 text-xs text-muted">{g.blurb}</p>

              <div className="mt-5 space-y-6">
                {items.map((book, index) => {
                  const y = originYear(book);
                  const showYear = y !== lastYear;
                  lastYear = y;
                  return (
                    <div key={book.id}>
                      {showYear && (
                        <div className="mb-3 flex items-center gap-3">
                          <span className="font-serif text-xl font-bold text-accent">{y ?? "Tarihsiz"}</span>
                          <span className="h-px flex-1 bg-line" aria-hidden />
                        </div>
                      )}
                      <ShelfCard book={book} priority={gi === 0 && index < 3} />
                    </div>
                  );
                })}
              </div>
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
          {book.originalYear && book.originalYear !== book.year ? (
            <span className="font-semibold text-accent">
              İlk baskı {book.originalYear}
              {book.year ? ` · bu baskı ${book.year}` : ""}
            </span>
          ) : (
            book.year && <span className="font-semibold text-accent">{book.year}</span>
          )}
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
