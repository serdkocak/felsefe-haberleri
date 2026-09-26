import type { Metadata, Viewport } from "next";

import { Analytics } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { ThinkerBanner } from "@/components/thinker-banner";
import { sans, serif } from "@/lib/fonts";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Felsefe Haberleri — Çağdaş filozoflardan güncel haberler",
    template: "%s — Felsefe Haberleri",
  },
  description:
    "Çağdaş filozofların konuşmaları, açıklamaları, fikirleri ve yeni kitapları. Gündem, Türkiye, Dünya, konferanslar, ödüller ve kitap haberleri.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Felsefe Haberleri",
  },
  // Paylaşım görseli, sekme ve uygulama simgeleri src/app altındaki dosyalardan
  // kendiliğinden bağlanır: opengraph-image.png, icon.png, apple-icon.png, favicon.ico
  twitter: { card: "summary_large_image" },
};

/** Mobil tarayıcı çubuğunun rengi — logonun laciverti ve kağıt tonu. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1f4354" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes tema sınıfını istemcide eklediği için gerekli.
    <html lang="tr" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <head>
        <Analytics />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThinkerBanner />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
