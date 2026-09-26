import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/section-heading";
import { getPastEvents, getPosts, getUpcomingEvents } from "@/lib/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Konferanslar",
  description:
    "Felsefe konferansları, sempozyumlar, seminerler, webinarlar ve bildiri çağrıları. Yaklaşan etkinlikler ve arşiv.",
};

/**
 * Konferanslar bölümü — etkinlik takvimi.
 * Üstte yaklaşan etkinlikler, altta geçmiş etkinlik arşivi ve konferans haberleri.
 */
export default async function EventsPage() {
  const [upcoming, past, { items: news }] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(12),
    getPosts({ categorySlug: "konferanslar", limit: 6 }),
  ]);

  return (
    <Container size="wide" className="py-12">
      <header className="border-b-2 border-ink pb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Etkinlik Takvimi</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Konferanslar</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted metin-yasli">
          Konferans, kongre, sempozyum, çalıştay, seminer, webinar ve bildiri çağrıları.
          Yalnızca kaynağı doğrulanmış etkinlikler listelenir.
        </p>
        <p className="mt-3 text-sm text-muted">
          Etkinlik duyurusu göndermek için{" "}
          <Link href="/iletisim" className="text-accent hover:underline">
            iletişim sayfasını
          </Link>{" "}
          kullanabilirsiniz: başlık, tarih, yer ve kayıt bağlantısı yeterli.
        </p>
      </header>

      {/* Yaklaşan */}
      <section className="py-10">
        <SectionHeading title="Yaklaşan Etkinlikler" note={`${upcoming.length} etkinlik`} />

        {upcoming.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Şu an takvimde doğrulanmış yaklaşan etkinlik yok. Yeni duyurular eklendikçe burada
            listelenecek.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Geçmiş */}
      {past.length > 0 && (
        <section className="border-t border-line py-10">
          <SectionHeading title="Geçmiş Etkinlikler" note="arşiv" />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {past.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </div>
        </section>
      )}

      {/* Konferans haberleri */}
      {news.length > 0 && (
        <section className="border-t border-line py-10">
          <SectionHeading title="Konferans Haberleri" href="/kategori/konferanslar" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
