import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uzak görseller (kapak fotoğrafları) için izin verilen kaynaklar.
  images: {
    /**
     * Vercel'in görsel optimizasyon kotası (Hobby planı) 1 Ekim 2026'da doldu;
     * /_next/image uçları "402 Payment required" döndürdüğü için sitedeki bütün
     * kapaklar ve logo kayboldu. Optimizasyonu kapatıyoruz: <Image> bileşeni
     * görselleri Vercel üzerinden geçirmeden doğrudan kaynağından yükler.
     * Kapak adresleri zaten Commons'ın kendi boyutlandırmasını (?width=1600 /
     * ?width=600) kullandığı için kalite ve boyut açısından kayıp yok.
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Special:FilePath dosyayı doğrudan sunar; arşiv portreleri buradan gelir.
      { protocol: "https", hostname: "commons.wikimedia.org" },
      // Kurumların basın kitlerinden alınan, kullanıma açık etkinlik görselleri.
      { protocol: "https", hostname: "philfest.bilkent.edu.tr" },
      { protocol: "https", hostname: "felsefe.medeniyet.edu.tr" },
    ],
  },
  /**
   * Bölüm adları değiştikçe eski adresler kırılmasın diye kalıcı yönlendirmeler.
   * Paylaşılmış bağlantılar ve arama motoru kayıtları böyle korunur.
   */
  async redirects() {
    return [
      { source: "/kategori/yasayan-filozoflar", destination: "/kategori/cagdas-filozoflar", permanent: true },
      { source: "/kategori/filozoflar", destination: "/kategori/cagdas-filozoflar", permanent: true },
      { source: "/kategori/konferanslar-ve-seminerler", destination: "/kategori/konferanslar", permanent: true },
      { source: "/kategori/kitap", destination: "/kategori/yeni-kitaplar", permanent: true },
      { source: "/kategori/anma", destination: "/kategori/filozoflar-hakkinda", permanent: true },
      { source: "/kategori/dergiler", destination: "/kategori/gundem", permanent: true },
      // İlk sürümde haberler /yazi altındaydı.
      { source: "/yazi/:slug", destination: "/haber/:slug", permanent: true },
    ];
  },

  // Mobil uygulamanın (Flutter) /api uçlarını farklı bir origin'den çağırabilmesi için CORS.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
