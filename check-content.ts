/**
 * İçerik ön denetimi — `npm run content:check`
 *
 * Amaç: `seed-data.ts` ile `schema.prisma` arasındaki uyuşmazlıkları, daha yayına
 * çıkmadan yakalamak. Veritabanı bağlantısı gerektirmez, saniyeler içinde çalışır.
 *
 * Kontrol ettikleri:
 *   1. Tohum verisindeki her alan, şemadaki gerçek bir sütuna karşılık geliyor mu?
 *      (Bir alanı şemaya eklemeyi unutmak ya da ilişki alanını düz veri sanmak,
 *       yayın sırasında derlemeyi durduran en sık hatadır.)
 *   2. Bölüm, etiket, filozof ve haber bağlantıları tutarlı mı?
 *   3. Slug'lar benzersiz mi?
 *   4. Kaynak adresleri geçerli mi?
 *   5. Yaşayan filozoflara ölüm tarihi yazılmış mı? (33. kural)
 *   6. Onay listesinde olmayan bir filozof dizine ya da habere bağlanmış mı?
 *   7. Yayın tarihi ileride kalmış bir haber var mı? (İleri tarihli haber sitede görünmez.)
 *
 * Hata bulursa çıkış kodu 1 döner; böylece derleme zincirinde de kullanılabilir.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  authors,
  books,
  categories,
  events,
  philosophers,
  posts,
  tags,
  type SeedPost,
} from "./seed-data";

const problems: string[] = [];

/* ------------------------------------------------------------------ */
/* 1. Şema sütunlarını oku                                             */
/* ------------------------------------------------------------------ */

const schema = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");

/** Prisma'nın yerleşik skaler tipleri. */
const SCALAR_TYPES = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
]);

/** Bir modelin skaler (ilişki olmayan) sütun adlarını döndürür. */
function scalarFields(model: string): Set<string> {
  const block = schema.match(new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`));
  if (!block) {
    problems.push(`Şemada '${model}' modeli bulunamadı.`);
    return new Set();
  }

  const fields = new Set<string>();

  for (const line of block[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@") || trimmed.startsWith("/")) {
      continue;
    }

    const match = trimmed.match(/^(\w+)\s+([\w[\]?]+)/);
    if (!match) continue;

    const [, name, rawType] = match;
    const type = rawType.replace(/[[\]?]/g, "");

    // Prisma'nın skaler tipleri de büyük harfle başlar; bu yüzden liste ile ayırıyoruz.
    // Listede olmayan büyük harfli tipler ilişki alanıdır ve veri nesnesine yazılmaz.
    if (SCALAR_TYPES.has(type)) fields.add(name);
  }

  return fields;
}

/** Tohum kaydındaki alanların hepsi şemada var mı? */
function checkFields(label: string, model: string, record: object, ignore: string[] = []) {
  const allowed = scalarFields(model);

  for (const key of Object.keys(record)) {
    if (ignore.includes(key)) continue;
    if (!allowed.has(key)) {
      problems.push(`${label}: '${key}' alanı ${model} modelinde yok (şemaya eklenmeli ya da tohumdan çıkarılmalı).`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2. Kayıtları denetle                                                */
/* ------------------------------------------------------------------ */

// İlişki üzerinden bağlanan alanlar veri nesnesine yazılmaz; denetimde hariç tutulur.
const postRelationKeys = ["authorSlug", "categorySlug", "tagSlugs", "philosopherSlugs", "sources"];
const bookRelationKeys = ["philosopherSlug", "postSlug"];

categories.forEach((item) => checkFields(`Bölüm '${item.slug}'`, "Category", item));
tags.forEach((item) => checkFields(`Etiket '${item.slug}'`, "Tag", item));
authors.forEach((item) => checkFields(`Editör '${item.slug}'`, "Author", item));
philosophers.forEach((item) => checkFields(`Filozof '${item.slug}'`, "Philosopher", item));
posts.forEach((item) => checkFields(`Haber '${item.slug}'`, "Post", item, postRelationKeys));
books.forEach((item) => checkFields(`Kitap '${item.slug}'`, "Book", item, bookRelationKeys));
events.forEach((item) => checkFields(`Etkinlik '${item.slug}'`, "Event", item));

/* ------------------------------------------------------------------ */
/* 3. Bağlantı ve içerik tutarlılığı                                   */
/* ------------------------------------------------------------------ */

const categorySlugs = new Set(categories.map((item) => item.slug));
const tagSlugs = new Set(tags.map((item) => item.slug));
const authorSlugs = new Set(authors.map((item) => item.slug));
const philosopherSlugs = new Set(philosophers.map((item) => item.slug));
const postSlugs = new Set(posts.map((item) => item.slug));

function checkUnique(label: string, values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) problems.push(`${label}: '${value}' slug'ı birden çok kez kullanılmış.`);
    seen.add(value);
  }
}

checkUnique("Haber", posts.map((item) => item.slug));
checkUnique("Etkinlik", events.map((item) => item.slug));
checkUnique("Filozof", philosophers.map((item) => item.slug));
checkUnique("Kitap", books.map((item) => item.slug));

/** Onay listesindeki (dizinde görünen) filozoflar. */
const listedPhilosophers = new Set(
  philosophers.filter((philosopher) => philosopher.listed).map((philosopher) => philosopher.slug),
);

for (const post of posts as SeedPost[]) {
  if (!categorySlugs.has(post.categorySlug)) {
    problems.push(`Haber '${post.slug}': '${post.categorySlug}' bölümü tanımlı değil.`);
  }
  if (!authorSlugs.has(post.authorSlug)) {
    problems.push(`Haber '${post.slug}': '${post.authorSlug}' editörü tanımlı değil.`);
  }
  post.tagSlugs.forEach((slug) => {
    if (!tagSlugs.has(slug)) problems.push(`Haber '${post.slug}': '${slug}' etiketi tanımlı değil.`);
  });
  post.philosopherSlugs.forEach((slug) => {
    if (!philosopherSlugs.has(slug)) {
      problems.push(`Haber '${post.slug}': '${slug}' filozofu tanımlı değil.`);
    } else if (!listedPhilosophers.has(slug)) {
      problems.push(
        `Haber '${post.slug}': '${slug}' onay listesinde değil, filozof etiketi olarak bağlanamaz.`,
      );
    }
  });
  (post.sources ?? []).forEach((source) => {
    if (!/^https?:\/\//.test(source.url)) {
      problems.push(`Haber '${post.slug}': geçersiz kaynak adresi (${source.url}).`);
    }
  });
  if (post.sourceUrl && !/^https?:\/\//.test(post.sourceUrl)) {
    problems.push(`Haber '${post.slug}': geçersiz ana kaynak adresi.`);
  }
}

books.forEach((book) => {
  if (book.postSlug && !postSlugs.has(book.postSlug)) {
    problems.push(`Kitap '${book.slug}': '${book.postSlug}' haberi bulunamadı.`);
  }
  if (book.philosopherSlug && !philosopherSlugs.has(book.philosopherSlug)) {
    problems.push(`Kitap '${book.slug}': '${book.philosopherSlug}' filozofu bulunamadı.`);
  }
});

philosophers.forEach((philosopher) => {
  // 33. kural: yaşayan filozofa ölüm tarihi yazılmaz.
  if (philosopher.alive !== false && philosopher.deathDate) {
    problems.push(`Filozof '${philosopher.slug}': yaşayan olarak işaretli ama ölüm tarihi var.`);
  }
  // Onay listesi: dizinde olmayan bir isim ana sayfada öne çıkarılamaz.
  if (philosopher.featured && !philosopher.listed) {
    problems.push(
      `Filozof '${philosopher.slug}': onay listesinde değil (listed: false) ama öne çıkarılmış (featured: true).`,
    );
  }
});

// Etkinlik tarihleri okunabilir olmalı.
events.forEach((event) => {
  if (Number.isNaN(new Date(event.startsAt).getTime())) {
    problems.push(`Etkinlik '${event.slug}': başlangıç tarihi geçersiz.`);
  }
});

/* ------------------------------------------------------------------ */
/* 3a. Site içindeki kapak görselleri gerçekten var mı?                */
/* ------------------------------------------------------------------ */

/**
 * "/" ile başlayan kapak adresleri `public` klasöründeki dosyalara işaret eder.
 * Dosya yoksa okur kırık bir görsel görür; bunu yayına çıkmadan yakalıyoruz.
 * (Adresi http ile başlayan uzak görseller burada denetlenmez.)
 */
[...posts.map((p) => ({ tip: "Haber", slug: p.slug, kapak: p.coverImage })),
 ...events.map((e) => ({ tip: "Etkinlik", slug: e.slug, kapak: e.coverImage }))]
  .forEach(({ tip, slug, kapak }) => {
    if (!kapak || !kapak.startsWith("/")) return;
    if (!existsSync(join(process.cwd(), "public", kapak))) {
      problems.push(`${tip} '${slug}': kapak görseli bulunamadı (public${kapak}).`);
    }
  });

/* ------------------------------------------------------------------ */
/* 3b. Yayın tarihi ileri tarihli mi?                                  */
/* ------------------------------------------------------------------ */

/**
 * Site yalnızca `publishedAt` değeri geçmişte olan haberleri gösterir.
 * İleri tarihli bir haber yazıldığı anda görünmez; "güncelleme yapıldı ama
 * sitede yok" tablosunun en sinsi nedeni budur. Bu yüzden ileri tarih hata sayılır.
 */
const now = Date.now();

posts.forEach((post) => {
  if (!post.publishedAt) return;
  const at = new Date(post.publishedAt).getTime();
  if (Number.isNaN(at)) {
    problems.push(`Haber '${post.slug}': yayın tarihi okunamadı (${post.publishedAt}).`);
  } else if (at > now) {
    problems.push(
      `Haber '${post.slug}': yayın tarihi ileride (${post.publishedAt}). ` +
        "İleri tarihli haber sitede görünmez; tarihi geçmişe çekin.",
    );
  }
});

events.forEach((event) => {
  // Site yalnızca publishedAt değeri geçmişte olan etkinlikleri listeler;
  // alanı boş bırakmak etkinliği sessizce görünmez kılar. Bu yüzden zorunlu.
  if (!event.publishedAt) {
    problems.push(
      `Etkinlik '${event.slug}': publishedAt eksik. Etkinlik sitede görünmez; ` +
        'geçmiş bir yayın tarihi ekleyin (örn. "2026-11-02T00:00:00.000Z").',
    );
    return;
  }
  const at = new Date(event.publishedAt).getTime();
  if (!Number.isNaN(at) && at > now) {
    problems.push(
      `Etkinlik '${event.slug}': yayın tarihi ileride (${event.publishedAt}). ` +
        "Etkinliğin kendi tarihi ileride olabilir, ama yayın tarihi geçmişte olmalı.",
    );
  }
});

/* ------------------------------------------------------------------ */
/* 4. Sonuç                                                            */
/* ------------------------------------------------------------------ */

if (problems.length > 0) {
  console.error(`\n❌ ${problems.length} sorun bulundu:\n`);
  problems.forEach((problem) => console.error(`   · ${problem}`));
  console.error("");
  process.exit(1);
}

console.log(
  `✅ İçerik denetimi temiz — ${posts.length} haber, ${events.length} etkinlik, ` +
    `${books.length} kitap, ${philosophers.length} filozof, ${categories.length} bölüm.`,
);
