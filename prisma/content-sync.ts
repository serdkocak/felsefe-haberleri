/**
 * İçerik eşitleme — her yayında (deploy) çalışır.
 *
 * `prisma/seed-data.ts` sitenin içerik kaynağıdır. Bu betik oradaki bölümleri,
 * etiketleri, editörleri, filozofları, haberleri, kitapları ve etkinlikleri
 * veritabanına **upsert** eder:
 *
 *   - Yeni kayıt eklenir.
 *   - Değişen kayıt güncellenir.
 *   - Dosyadan çıkarılan kayıt **silinmez** (55/56. kural).
 *   - Okur verisine (yorum, üye, mesaj) hiç dokunulmaz.
 *
 * ── Neden bu kadar savunmacı yazıldı? ────────────────────────────────
 * Önceki sürüm, hata olursa yalnızca bir uyarı yazıp sessizce geçiyordu.
 * Sonuç: Vercel "Ready" diyordu ama içerik siteye hiç işlenmemiş oluyordu.
 * Yeşil tik, boş bir siteyi gizliyordu. Artık:
 *
 *   1. Bağlantı, havuzlanmış (pooled) adres yerine DIRECT_URL üzerinden kurulur.
 *      Uzun süren toplu yazmalarda havuz (pgbouncer) bağlantıyı kesebiliyor.
 *   2. Her kayıt kendi try/catch'i içinde işlenir; biri patlarsa diğerleri devam eder.
 *   3. Başarısız kayıt, yeni bir bağlantıyla birkaç kez yeniden denenir.
 *   4. Her adım için sayı ve süre yazılır; hata olursa hangi kaydın,
 *      hangi mesajla düştüğü açıkça basılır.
 *   5. Sonunda hâlâ başarısız kayıt varsa çıkış kodu 1 döner — derleme kırmızı olur.
 *      Yanlış bir "Ready" yerine okunabilir bir hata tercih edilir.
 */
import { PrismaClient } from "@prisma/client";

import { authors, books, categories, events, philosophers, posts, tags } from "./seed-data";

/**
 * Toplu yazma için doğrudan bağlantı yeğlenir.
 * Neon'da DATABASE_URL havuzlanmış (`-pooler`) adrestir; yüzlerce ardışık
 * yazma işleminde bağlantıyı düşürebilir. DIRECT_URL tanımlı değilse
 * DATABASE_URL'e düşülür, böylece yerelde de çalışır.
 */
const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

function newClient() {
  return new PrismaClient({
    log: ["error"],
    ...(connectionUrl ? { datasourceUrl: connectionUrl } : {}),
  });
}

let prisma = newClient();

/** Başarısız kayıtların künyesi — sonunda topluca raporlanır. */
const failures: Array<{ step: string; key: string; message: string }> = [];

/**
 * Tek bir kaydı yazar. Hata olursa bağlantıyı yenileyip yeniden dener.
 * Üç denemede de olmazsa kaydı `failures` listesine ekler ve döngüyü sürdürür.
 */
async function writeRecord(step: string, key: string, run: () => Promise<unknown>) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await run();
      return true;
    } catch (error) {
      const message = (error as Error).message.split("\n").slice(0, 4).join(" ").trim();

      if (attempt === 3) {
        failures.push({ step, key, message });
        console.error(`   ✗ ${step} · ${key} → ${message}`);
        return false;
      }

      // Bağlantı düşmüş olabilir: istemciyi yenileyip tekrar dene.
      console.warn(`   … ${step} · ${key} (${attempt}. deneme başarısız, yeniden bağlanılıyor)`);
      try {
        await prisma.$disconnect();
      } catch {
        /* kapatma hatası önemsiz */
      }
      prisma = newClient();
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  return false;
}

/** Bir adımı çalıştırır, süresini ve sayısını yazar. */
async function step<T>(name: string, items: T[], key: (item: T) => string, run: (item: T) => Promise<unknown>) {
  const started = Date.now();
  let ok = 0;

  for (const item of items) {
    if (await writeRecord(name, key(item), () => run(item))) ok++;
  }

  const failed = items.length - ok;
  const suffix = failed > 0 ? ` · ${failed} BAŞARISIZ` : "";
  console.log(`   ${failed > 0 ? "⚠" : "✓"} ${name}: ${ok}/${items.length}${suffix} (${Date.now() - started} ms)`);
}

async function main() {
  const started = Date.now();

  console.log("\n📚 İçerik eşitleniyor…");
  console.log(
    `   Bağlantı: ${connectionUrl === process.env.DIRECT_URL && process.env.DIRECT_URL ? "DIRECT_URL (doğrudan)" : "DATABASE_URL"}`,
  );

  await prisma.$connect();

  /* 1) Bölümler ---------------------------------------------------- */
  await step("Bölümler", categories, (c) => c.slug, (category) =>
    prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, order: category.order },
      create: category,
    }),
  );

  /* 2) Etiketler --------------------------------------------------- */
  await step("Etiketler", tags, (t) => t.slug, (tag) =>
    prisma.tag.upsert({ where: { slug: tag.slug }, update: { name: tag.name }, create: tag }),
  );

  /* 3) Editörler --------------------------------------------------- */
  await step("Editörler", authors, (a) => a.slug, (author) =>
    prisma.author.upsert({
      where: { slug: author.slug },
      update: { name: author.name, avatar: author.avatar, bio: author.bio },
      create: author,
    }),
  );

  /* 4) Filozoflar -------------------------------------------------- */
  await step("Filozoflar", philosophers, (p) => p.slug, (philosopher) =>
    prisma.philosopher.upsert({
      where: { slug: philosopher.slug },
      update: philosopher,
      create: philosopher,
    }),
  );

  /* 5) Haberler ---------------------------------------------------- */

  /*
   * Değişmeyen haberi yeniden yazmıyoruz.
   *
   * Eskiden her yayında 300'ü aşkın haber baştan yazılıyordu (upsert + kaynak
   * silme/ekleme); bu 10 dakikayı aşıyor ve Neon'un compute kotasını yiyordu.
   * Şimdi veritabanındaki hâl tek sorguyla okunur, her haber için bir "parmak izi"
   * çıkarılır ve yalnızca parmak izi değişen ya da yeni olan haber yazılır.
   * Emin olunamayan her durumda yazmaya düşülür; yani en kötü ihtimalle eski
   * davranışa dönülür, hiçbir değişiklik kaçırılmaz.
   */
  const fingerprintSeed = (post: (typeof posts)[number]) =>
    JSON.stringify({
      title: post.title,
      summary: post.summary,
      content: post.content,
      seoTitle: post.seoTitle ?? null,
      metaDescription: post.metaDescription ?? null,
      contentType: post.contentType ?? "HABER",
      coverImage: post.coverImage ?? null,
      imageCredit: post.imageCredit ?? null,
      featured: post.featured,
      sourceName: post.sourceName ?? null,
      sourceUrl: post.sourceUrl ?? null,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
      authorSlug: post.authorSlug,
      categorySlug: post.categorySlug,
      tagSlugs: [...post.tagSlugs].sort(),
      philosopherSlugs: [...post.philosopherSlugs].sort(),
      sources: (post.sources ?? []).map((s) => ({
        title: s.title,
        publisher: s.publisher ?? null,
        date: s.date ?? null,
        url: s.url,
        primary: s.primary ?? false,
      })),
    });

  const unchanged = new Set<string>();
  try {
    const existing = await prisma.post.findMany({
      select: {
        slug: true,
        title: true,
        summary: true,
        content: true,
        seoTitle: true,
        metaDescription: true,
        contentType: true,
        coverImage: true,
        imageCredit: true,
        featured: true,
        sourceName: true,
        sourceUrl: true,
        publishedAt: true,
        author: { select: { slug: true } },
        category: { select: { slug: true } },
        tags: { select: { slug: true } },
        philosophers: { select: { slug: true } },
        sources: {
          orderBy: { order: "asc" },
          select: { title: true, publisher: true, date: true, url: true, primary: true },
        },
      },
    });

    const existingBySlug = new Map(
      existing.map((row) => [
        row.slug,
        JSON.stringify({
          title: row.title,
          summary: row.summary,
          content: row.content,
          seoTitle: row.seoTitle,
          metaDescription: row.metaDescription,
          contentType: row.contentType,
          coverImage: row.coverImage,
          imageCredit: row.imageCredit,
          featured: row.featured,
          sourceName: row.sourceName,
          sourceUrl: row.sourceUrl,
          publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
          authorSlug: row.author.slug,
          categorySlug: row.category.slug,
          tagSlugs: row.tags.map((t) => t.slug).sort(),
          philosopherSlugs: row.philosophers.map((p) => p.slug).sort(),
          sources: row.sources.map((s) => ({
            title: s.title,
            publisher: s.publisher,
            date: s.date,
            url: s.url,
            primary: s.primary,
          })),
        }),
      ]),
    );

    for (const post of posts) {
      if (existingBySlug.get(post.slug) === fingerprintSeed(post)) unchanged.add(post.slug);
    }
    console.log(`   · Haberler: ${unchanged.size}/${posts.length} değişmemiş, atlanıyor.`);
  } catch (error) {
    // Karşılaştırma başarısızsa hepsini yazmaya düş; içerik kaybı olmaz.
    console.warn("   … Mevcut haberler okunamadı, hepsi yazılacak:", (error as Error).message.split("\n")[0]);
  }

  await step("Haberler", posts, (p) => p.slug, async (post) => {
    if (unchanged.has(post.slug)) return;

    // `sources` bir ilişki tablosudur; aşağıda ayrıca yazılır, veri nesnesine karışmaz.
    const { authorSlug, categorySlug, tagSlugs, philosopherSlugs, publishedAt, sources, ...rest } =
      post;

    const data = {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      author: { connect: { slug: authorSlug } },
      category: { connect: { slug: categorySlug } },
    };

    const tagConnect = tagSlugs.map((slug) => ({ slug }));
    const philosopherConnect = philosopherSlugs.map((slug) => ({ slug }));

    const saved = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        ...data,
        // Listeleri önce boşaltıp yeniden bağlıyoruz ki kaldırılan ilişkiler kalmasın.
        tags: { set: [], connect: tagConnect },
        philosophers: { set: [], connect: philosopherConnect },
      },
      create: {
        ...data,
        tags: { connect: tagConnect },
        philosophers: { connect: philosopherConnect },
      },
      select: { id: true },
    });

    // Kaynak künyesi: haberin kendi kaynakları yeniden yazılır.
    // (Bunlar haberin alt kayıtlarıdır; içerik silme sayılmaz.)
    await prisma.postSource.deleteMany({ where: { postId: saved.id } });

    if (sources?.length) {
      await prisma.postSource.createMany({
        data: sources.map((source, index) => ({
          postId: saved.id,
          title: source.title,
          publisher: source.publisher ?? null,
          date: source.date ?? null,
          url: source.url,
          primary: source.primary ?? false,
          order: index,
        })),
      });
    }
  });

  /* 6) Kitaplar ---------------------------------------------------- */
  await step("Kitaplar", books, (b) => b.slug, (book) => {
    const { philosopherSlug, postSlug, ...rest } = book;

    const data = {
      ...rest,
      philosopher: philosopherSlug ? { connect: { slug: philosopherSlug } } : undefined,
      post: postSlug ? { connect: { slug: postSlug } } : undefined,
    };

    return prisma.book.upsert({ where: { slug: book.slug }, update: data, create: data });
  });

  /* 7) Etkinlikler (Konferanslar bölümü) --------------------------- */
  await step("Etkinlikler", events, (e) => e.slug, (event) => {
    const data = {
      ...event,
      startsAt: new Date(event.startsAt),
      endsAt: event.endsAt ? new Date(event.endsAt) : null,
      deadline: event.deadline ? new Date(event.deadline) : null,
      cfpDeadline: event.cfpDeadline ? new Date(event.cfpDeadline) : null,
      publishedAt: event.publishedAt ? new Date(event.publishedAt) : null,
    };

    return prisma.event.upsert({ where: { slug: event.slug }, update: data, create: data });
  });

  /* Sonuç ---------------------------------------------------------- */
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (failures.length === 0) {
    console.log(`\n✅ İçerik eşitlendi — tüm kayıtlar yazıldı (${seconds} sn).\n`);
    return;
  }

  console.error(`\n❌ ${failures.length} kayıt yazılamadı (${seconds} sn):\n`);
  for (const failure of failures) {
    console.error(`   · [${failure.step}] ${failure.key}`);
    console.error(`     ${failure.message}`);
  }
  console.error(
    "\nDerleme burada durduruldu. Yeşil bir 'Ready' ile eksik içerik yayınlamaktansa\n" +
      "hatayı görünür kılmayı yeğliyoruz. Yukarıdaki mesaj sorunun kaynağını gösterir.\n",
  );
  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("\n❌ İçerik eşitlenemedi:", (error as Error).message);
    console.error((error as Error).stack);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      /* kapatma hatası önemsiz */
    }
  });
