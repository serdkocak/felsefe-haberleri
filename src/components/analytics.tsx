import Script from "next/script";

/**
 * Google Analytics (GA4) etiketi.
 *
 * Ölçüm kimliği `NEXT_PUBLIC_GA_ID` ortam değişkeninden okunur; tanımlı değilse
 * sitenin kendi kimliği kullanılır. Kimliği boş bırakmak (NEXT_PUBLIC_GA_ID="")
 * etiketi tamamen devre dışı bırakır.
 *
 * Etiket yalnızca üretim ortamında yüklenir; geliştirme sırasında sahte trafik
 * toplanmasın diye.
 */
const DEFAULT_GA_ID = "G-KB8KY0NSPC";

const gaId = process.env.NEXT_PUBLIC_GA_ID ?? DEFAULT_GA_ID;

export function Analytics() {
  if (!gaId || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
