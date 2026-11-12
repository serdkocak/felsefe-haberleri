import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/abone/"] },
      // Yapay zekâ veri toplayıcıları siteyi sürekli tarayıp sunucu kaynağı tüketiyor.
      { userAgent: ["GPTBot", "CCBot", "ClaudeBot", "Bytespider", "Amazonbot", "PetalBot", "meta-externalagent"], disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
