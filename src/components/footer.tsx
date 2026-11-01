import Link from "next/link";

import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { SubscribeForm } from "@/components/subscribe-form";
import { getCategories } from "@/lib/queries";

const contactEmail = process.env.CONTACT_EMAIL ?? "info@felsefehaberleri.com";
const contactEmailAlt = process.env.CONTACT_EMAIL_ALT ?? "felsefehaberleri@gmail.com";

export async function Footer() {
  const categories = await getCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container size="wide" className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          {/* İkincil logo (kartal ve yılan) tam kilit hâliyle alt bilgide durur. */}
          <Link href="/" className="inline-block">
            <Logo
              variant="eagle"
              className="h-24 w-auto"
              alt="Felsefe Haberleri"
              sizes="96px"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted metin-yasli">
            Çağdaş filozofların konuşmaları, açıklamaları, fikirleri ve yeni kitapları.
            Her haberin kaynağı künyesinde belirtilir.
          </p>

          <p className="mt-5 text-xs font-semibold tracking-widest text-muted uppercase">İletişim</p>
          <a
            href={`mailto:${contactEmail}`}
            className="mt-2 block text-sm text-accent hover:underline"
          >
            {contactEmail}
          </a>
          <a
            href={`mailto:${contactEmailAlt}`}
            className="mt-1 block text-sm text-accent hover:underline"
          >
            {contactEmailAlt}
          </a>
          <p className="mt-1 text-sm">
            <Link href="/iletisim" className="text-ink-soft transition-colors hover:text-accent">
              Mesaj gönderme formu →
            </Link>
          </p>

          <div className="mt-6 max-w-sm">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">Bültene üye olun</p>
            <SubscribeForm variant="inline" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Bölümler</p>
          <ul className="mt-4 space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Site</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li><Link className="transition-colors hover:text-accent" href="/filozoflar">Filozoflar</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/kitaplar">Kitaplar</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/konferanslar">Konferanslar/Etkinlikler</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/hakkinda">Hakkında</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/iletisim">İletişim</Link></li>
          </ul>

          <p className="mt-6 text-xs font-semibold tracking-widest text-muted uppercase">Geliştiriciler</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li><Link className="transition-colors hover:text-accent" href="/api/posts">/api/posts</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/api/philosophers">/api/philosophers</Link></li>
            <li><Link className="transition-colors hover:text-accent" href="/api/books">/api/books</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container size="wide" className="py-6 text-xs text-muted">
          © {year} Felsefe Haberleri — Haberler kaynak gösterilerek derlenir.
        </Container>
      </div>
    </footer>
  );
}
