import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Hakkında",
  description:
    "Felsefe Haberleri, çağdaş felsefe dünyasındaki gelişmeleri takip eden bağımsız bir dijital haber ve yayın platformudur. Yayın anlayışımız, ilkelerimiz ve bölümlerimiz.",
};

const primaryEmail = process.env.CONTACT_EMAIL ?? "info@felsefehaberleri.com";
const secondaryEmail = process.env.CONTACT_EMAIL_ALT ?? "felsefehaberleri@gmail.com";

/** Yayın alanı kartı — bölüm adı ve ne kapsadığı. */
function Alan({ ad, slug, children }: { ad: string; slug: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-4 sm:grid sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
      <dt className="font-serif text-base font-bold">
        <Link href={slug === "konferanslar" ? "/konferanslar" : `/kategori/${slug}`} className="hover:text-accent">
          {ad}
        </Link>
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-ink-soft sm:mt-0">{children}</dd>
    </div>
  );
}

/** Yayın ilkesi — başlık ve açıklama. */
function Ilke({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-accent pl-5">
      <h3 className="font-serif text-lg font-bold">{baslik}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft metin-yasli">{children}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Container size="reading" className="py-14">
      {/* Künye başlığı */}
      <header className="border-b-2 border-ink pb-8 text-center">
        <Logo variant="owl-mark" className="mx-auto h-20 w-auto" alt="" sizes="80px" />
        <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-accent uppercase">Hakkında</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Felsefe Haberleri</h1>
        <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft">
          Güncel düşüncenin haberi.
        </p>
      </header>

      <div className="prose prose-philo mt-10 max-w-none">
        <p>
          <strong>Felsefe Haberleri</strong>, çağdaş felsefe dünyasında yaşanan gelişmeleri takip
          eden bağımsız bir dijital haber ve yayın platformudur.
        </p>

        <p>
          Felsefenin yalnızca akademik çevrelerde, üniversitelerde ve uzmanlık yayınlarında
          tartışılan bir alan olmadığına inanıyoruz. Felsefi düşünce; siyaset, hukuk, bilim,
          teknoloji, yapay zekâ, kültür, sanat, toplum ve gündelik hayatla doğrudan ilişkilidir.
          Bu nedenle felsefeyi <strong>güncel bir haber alanı</strong> olarak ele alıyoruz.
        </p>

        <p>
          Çağdaş filozofların konuşmalarını, açıklamalarını ve yeni çalışmalarını; yayımlanan
          kitapları, önemli konferansları, ödülleri ve felsefe dünyasındaki gelişmeleri takip
          eder, Türkçe okura ulaştırırız. Amacımız, dünyada üretilen çağdaş felsefi düşüncenin
          Türkiye&apos;deki okurlarla daha hızlı, anlaşılır ve güvenilir biçimde buluşmasına
          katkıda bulunmaktır.
        </p>
      </div>

      {/* Yayın anlayışı */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Yayın anlayışımız</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="prose prose-philo mt-6 max-w-none">
          <p>
            Felsefe Haberleri bir akademik dergi değildir. Akademik çalışmaların yerine geçmeyi
            değil, akademik ve düşünsel dünyada üretilen fikirleri haber, söyleşi, kitap ve gündem
            içerikleri aracılığıyla daha geniş bir okur kitlesine ulaştırmayı amaçlar.
          </p>
          <p>Yayınlarımızda özellikle şu sorulara odaklanıyoruz:</p>
        </div>

        <ul className="mt-5 space-y-3">
          {[
            "Bugün filozoflar hangi meseleleri tartışıyor?",
            "Dünyanın önde gelen düşünürleri güncel gelişmeler hakkında ne söylüyor?",
            "Yeni yayımlanan felsefe kitapları hangi fikirleri gündeme getiriyor?",
            "Felsefe; yapay zekâ, bilim, teknoloji, siyaset, hukuk ve toplum gibi alanlarla nasıl kesişiyor?",
            "Dünyanın farklı ülkelerinde felsefe alanında hangi gelişmeler yaşanıyor?",
            "Tarihin önemli filozoflarının fikirleri günümüz dünyasında nasıl yeniden tartışılıyor?",
          ].map((soru) => (
            <li key={soru} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>{soru}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Yayın ilkeleri */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Yayın ilkelerimiz</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-muted metin-yasli">
          Temel yayın ilkelerimiz kaynak şeffaflığı, doğruluk, bağlam, editoryal bağımsızlık,
          düzeltilebilirlik ve çoğulculuktur.
        </p>

        <div className="mt-8 space-y-8">
          <Ilke baslik="Kaynak şeffaflığı">
            Haberlerde kullanılan kaynaklar mümkün olduğunca açık biçimde belirtilir. Okurun bir
            bilginin nereden geldiğini görebilmesini ve gerektiğinde kaynağın kendisine
            ulaşabilmesini önemsiyoruz.
          </Ilke>

          <Ilke baslik="Doğruluk ve doğrulama">
            Özellikle filozoflara, akademisyenlere ve düşünürlere atfedilen görüş ve ifadelerin
            güvenilir kaynaklara dayanmasına dikkat edilir. Bir kişinin söylemediği bir düşüncenin
            ona mal edilmesi ya da bir açıklamanın bağlamından koparılarak aktarılması, felsefe
            haberciliğinin temel ilkeleriyle bağdaşmaz.
          </Ilke>

          <Ilke baslik="Bağlam">
            Felsefi düşünceler çoğu zaman tek bir cümleye indirgenemeyecek kadar kapsamlıdır. Bu
            nedenle açıklama, alıntı ve tartışmalar mümkün olduğunca ortaya çıktıkları bağlam
            içinde aktarılır.
          </Ilke>

          <Ilke baslik="Editoryal bağımsızlık">
            Yayın politikamız herhangi bir siyasi parti, ideolojik grup, ticari kuruluş veya
            akademik çevrenin editoryal yönlendirmesine dayanmaz. Farklı düşünce geleneklerine,
            görüşlere ve felsefi yaklaşımlara eşit mesafede durmaya çalışırız.
          </Ilke>

          <Ilke baslik="Düzeltme politikası">
            Yayımlanan bir içerikte maddi bir hata tespit edilmesi hâlinde gerekli düzeltme
            yapılır. Önemli düzeltmeler okurun fark edebileceği şekilde açıkça belirtilir.
          </Ilke>

          <Ilke baslik="Çoğulculuk">
            Felsefe, tek bir doğru düşünce sisteminden ibaret değildir. Farklı felsefi geleneklere,
            yaklaşımlara ve karşıt görüşlere yer vermek yayın anlayışımızın temel unsurlarından
            biridir.
          </Ilke>
        </div>
      </section>

      {/* Yayın alanları */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Yayın alanlarımız</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <dl className="mt-4">
          <Alan ad="Gündem" slug="gundem">
            Felsefe dünyasında meydana gelen güncel gelişmeler, tartışmalar ve açıklamalar.
          </Alan>
          <Alan ad="Çağdaş Filozoflar" slug="cagdas-filozoflar">
            Yaşayan filozofların çalışmaları, konuşmaları, açıklamaları, yeni kitapları ve
            düşünceleri.
          </Alan>
          <Alan ad="Türkiye" slug="turkiye">
            Türkiye&apos;deki felsefe dünyasından haberler, etkinlikler, akademik çalışmalar ve
            yayınlar.
          </Alan>
          <Alan ad="Dünya" slug="dunya">
            Uluslararası felsefe dünyasından önemli gelişmeler ve düşünce gündemi.
          </Alan>
          <Alan ad="Konferanslar/Etkinlikler" slug="konferanslar">
            Kongre, konferans, sempozyum, panel, söyleşi ve diğer felsefe etkinlikleri.
          </Alan>
          <Alan ad="Filozoflar Hakkında" slug="filozoflar-hakkinda">
            Filozofların yaşamları, eserleri, düşünceleri ve entelektüel mirasları.
          </Alan>
          <Alan ad="Yeni Kitaplar" slug="yeni-kitaplar">
            Yeni yayımlanan felsefe kitapları ve felsefe yayıncılığındaki önemli gelişmeler.
          </Alan>
          <Alan ad="Ödüller" slug="oduller">
            Felsefe alanındaki ulusal ve uluslararası ödüller, ödül sahipleri ve adaylıklar.
          </Alan>
          <Alan ad="Felsefe Tarihinde Bugün" slug="felsefe-tarihinde-bugun">
            Felsefe tarihinde belirli bir tarihte meydana gelen önemli olaylar, doğumlar,
            ölümler, yayımlar ve gelişmeler.
          </Alan>
        </dl>
      </section>

      {/* Odak */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Güncel felsefeyi takip ediyoruz</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="prose prose-philo mt-6 max-w-none">
          <p>
            Odağımızda özellikle yaşayan ve günümüz düşünce dünyasında etkili olan filozoflar
            bulunur. Bir filozofun yeni kitabı, verdiği önemli bir söyleşi, katıldığı bir
            konferans, güncel bir politik veya toplumsal mesele hakkındaki açıklaması ya da yeni
            bir akademik çalışması bizim için haber değeri taşıyabilir.
          </p>
          <p>
            Bunun yanında felsefenin diğer disiplinlerle kesiştiği alanları da izliyoruz: yapay
            zekâ ve etik, teknoloji felsefesi, hukuk felsefesi, siyaset felsefesi, bilim felsefesi,
            zihin felsefesi, çevre felsefesi, estetik ve kültür felsefesi.
          </p>
        </div>

        <p className="mt-6 text-sm text-muted">
          Takip ettiğimiz isimlerin tamamı için{" "}
          <Link href="/filozoflar" className="text-accent hover:underline">
            Filozof Dizini
          </Link>
          &apos;ne bakabilirsiniz.
        </p>
      </section>

      {/* Felsefe ve güncel dünya */}
      <section className="mt-14 rounded-xl border border-line bg-surface p-7 sm:p-9">
        <h2 className="font-serif text-xl font-bold">Felsefe ve güncel dünya</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft metin-yasli">
          Bugünün dünyasında karşı karşıya olduğumuz birçok sorun aynı zamanda felsefi sorulardır.
        </p>

        <ul className="mt-6 space-y-3 font-serif text-[17px] leading-relaxed">
          {[
            "Yapay zekâ insan olmayı nasıl değiştirecek?",
            "Özgürlük ile güvenlik arasındaki sınır nerede?",
            "Demokrasi hangi koşullarda sürdürülebilir?",
            "Adalet nedir?",
            "Bilimsel bilginin sınırları nelerdir?",
            "İnsan ile makine arasındaki fark gelecekte nasıl tanımlanacak?",
            "İklim krizinin etik sonuçları nelerdir?",
          ].map((soru) => (
            <li key={soru} className="text-ink">
              {soru}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft metin-yasli">
          Bu ve benzeri sorular yalnızca filozofların değil, toplumun tamamının gündemindedir.
          Felsefe Haberleri, bu soruların etrafında şekillenen düşünsel tartışmaları görünür
          kılmayı amaçlar.
        </p>
      </section>

      {/* Editör */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Editör</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="mt-6">
          <p className="font-serif text-lg font-bold">Dr. Serdar Koçak</p>
          <p className="mt-1 text-xs tracking-[0.16em] text-accent uppercase">Kurucu editör</p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Felsefe Haberleri&apos;nin kurucusu ve editörüdür.
          </p>
        </div>
      </section>

      {/* Düzeltme ve katkı */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">Düzeltme ve katkı</h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="prose prose-philo mt-6 max-w-none">
          <p>
            Bir haberde hata olduğunu düşünüyorsanız veya yayınlarımızla ilgili bir düzeltme
            öneriniz varsa{" "}
            <Link href="/iletisim">iletişim sayfasından</Link> bize yazabilirsiniz.
          </p>
          <p>
            Üniversiteler, araştırma merkezleri, yayınevleri, düşünce kuruluşları ve etkinlik
            organizatörleri de felsefe alanındaki konferans, sempozyum, panel, söyleşi, kitap ve
            diğer etkinliklere ilişkin bilgileri editoryal değerlendirme için iletebilir.
          </p>
          <p>Etkinlik duyurularında şunların bulunması yeterlidir:</p>
          <ul>
            <li>etkinliğin adı,</li>
            <li>tarih ve saat,</li>
            <li>yer veya çevrim içi platform,</li>
            <li>konuşmacılar,</li>
            <li>kısa açıklama,</li>
            <li>kayıt veya resmî bilgi bağlantısı.</li>
          </ul>
          <p>Gönderilen içeriklerin yayımlanması editoryal değerlendirmeye tabidir.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <a href={`mailto:${primaryEmail}`} className="text-accent hover:underline">
            {primaryEmail}
          </a>
          <a href={`mailto:${secondaryEmail}`} className="text-accent hover:underline">
            {secondaryEmail}
          </a>
        </div>
      </section>

      {/* API */}
      <section className="mt-14">
        <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
          <h2 className="font-serif text-xl font-bold tracking-wide">
            Dijital yayıncılık ve açık içerik altyapısı
          </h2>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="prose prose-philo mt-6 max-w-none">
          <p>
            Felsefe Haberleri, günümüz dijital yayıncılığının gerektirdiği teknolojik altyapı
            gözetilerek tasarlanmıştır. Sitedeki içerikler, gelecekte farklı dijital platformlarda
            ve uygulamalarda kullanılabilmesine olanak sağlayan bir API altyapısı üzerinden de
            sunulmaktadır.
          </p>
          <p>Başlıca API uçları:</p>
          <ul>
            <li><code>GET /api/posts?page=1&amp;limit=10&amp;category=gundem</code></li>
            <li><code>GET /api/posts/[slug]</code></li>
            <li><code>GET /api/categories</code></li>
            <li><code>GET /api/philosophers</code></li>
            <li><code>GET /api/philosophers/[slug]</code></li>
            <li><code>GET /api/books</code></li>
            <li><code>GET /api/events?scope=upcoming</code></li>
            <li><code>GET /api/tags</code></li>
          </ul>
        </div>
      </section>

      {/* Kapanış */}
      <section className="mt-14 border-t-2 border-ink pt-10 text-center">
        <h2 className="font-serif text-2xl font-bold">Felsefe bugünün meselesidir</h2>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Felsefe yalnızca geçmişte yaşamış düşünürlerin fikirlerini incelemek değildir. Felsefe
          aynı zamanda bugünü anlamak, mevcut kabulleri sorgulamak ve geleceğe ilişkin sorular
          sormaktır. Felsefe Haberleri, dünyanın farklı yerlerinde üretilen bu düşünceleri,
          tartışmaları ve gelişmeleri takip ederek Türkçe okura ulaştırmayı amaçlar.
        </p>
        <p className="mt-8 font-serif text-sm tracking-[0.14em] text-muted uppercase">
          Felsefe Haberleri — Güncel düşüncenin haberi
        </p>
      </section>
    </Container>
  );
}
