/**
 * Ödül takvimi — "Ödüller" bölümünün üstünde gösterilen zaman çizelgesi.
 *
 * Her kayıt bir ödül anıdır: duyuru, kısa liste, tören ya da atölye.
 * `date` sıralama ve durum (geçmiş / yaklaşan / ileri tarih) hesaplaması için
 * kullanılır; `precision: "month"` yalnızca ayı bilinen tarihlerde gün gösterimini
 * gizler. `href` varsa kayıt ilgili habere bağlanır.
 *
 * Kural: Yalnızca birincil kaynaktan doğrulanmış tarihler eklenir. Tarihi
 * kesinleşmemiş törenler listeye alınmaz.
 */
export type AwardEntry = {
  /** ISO tarih (YYYY-MM-DD). */
  date: string;
  precision?: "day" | "month";
  /** Ödülün adı. */
  award: string;
  /** Kazanan / aday / açıklanacak. */
  laureate: string;
  /** Anın türü: duyuru, tören, kısa liste, atölye, açıklanacak. */
  kind: "Duyuru" | "Tören" | "Kısa liste" | "Atölye" | "Açıklanacak" | "Yarışma";
  /** Kısa not: alan, tutar, yer. */
  note?: string;
  /** İlgili haberin yolu. */
  href?: string;
};

export const awardsCalendar: AwardEntry[] = [
  { date: "2026-03-01", precision: "month", award: "Rolf Schock Ödülü (Mantık ve Felsefe)", laureate: "Bas van Fraassen", kind: "Duyuru", note: "İsveç Kraliyet Bilimler Akademisi · 600 bin SEK", href: "/haber/rolf-schock-odulu-2026-bas-van-fraassen" },
  { date: "2026-03-01", precision: "month", award: "Holberg Ödülü", laureate: "Lyndal Roper", kind: "Duyuru", note: "Bergen · tören haziranda yapıldı", href: "/haber/holberg-odulu-2026-lyndal-roper" },
  { date: "2026-07-23", award: "Fields Madalyası", laureate: "Deng, Pardon, Tsimerman, Wang", kind: "Tören", note: "ICM 2026, Philadelphia", href: "/haber/fields-madalyasi-2026-deng-pardon-tsimerman-wang" },
  { date: "2026-08-01", precision: "month", award: "Berggruen Felsefe ve Kültür Ödülü", laureate: "Michael Sandel", kind: "Duyuru", note: "1 milyon dolar", href: "/haber/berggruen-odulu-michael-sandel" },
  { date: "2026-08-25", award: "Lebowitz Felsefi Başarı Ödülü", laureate: "Felipe De Brigard ve Sarah Robins", kind: "Duyuru", note: "APA & Phi Beta Kappa · kişi başı 25 bin dolar", href: "/haber/lebowitz-odulu-2026-de-brigard-robins" },
  { date: "2026-09-01", precision: "month", award: "Tractatus Deneme Ödülü", laureate: "Maria-Sibylla Lotter", kind: "Duyuru", note: "Philosophicum Lech · 25 bin avro", href: "/haber/tractatus-odulu-2026-maria-sibylla-lotter-opfer" },
  { date: "2026-09-01", precision: "month", award: "Karl Jaspers Ödülü", laureate: "Seyla Benhabib", kind: "Duyuru", note: "Heidelberg", href: "/haber/karl-jaspers-odulu-2026-seyla-benhabib" },
  { date: "2026-09-01", precision: "month", award: "NASSP Kitap Ödülü", laureate: "Ladelle McWhorter", kind: "Duyuru", note: "Unbecoming Persons", href: "/haber/nassp-kitap-odulu-2026-mcwhorter-unbecoming-persons" },
  { date: "2026-09-01", precision: "month", award: "Balzan Ödülü", laureate: "Elena Esposito", kind: "Duyuru", note: "Yapay iletişim", href: "/haber/elena-esposito-balzan-odulu-yapay-iletisim" },
  { date: "2026-09-14", award: "Lakatos Ödülü", laureate: "John D. Norton", kind: "Duyuru", note: "LSE · bilim felsefesi · 10 bin sterlin", href: "/haber/oduller-lakatos-2026-norton-prix-lyceen-vuille" },
  { date: "2026-09-22", award: "John W. Kluge Ödülü", laureate: "Martha C. Nussbaum", kind: "Duyuru", note: "ABD Kongre Kütüphanesi · 500 bin dolar", href: "/haber/felsefe-odulleri-sonbahar-2026-kluge-nussbaum-leibniz-vetter-dixsaut-olimpiyat" },
  { date: "2026-09-30", award: "Hannah Arendt Siyasi Düşünce Ödülü", laureate: "Lea Ypi", kind: "Duyuru", note: "Bremen · 10 bin avro", href: "/haber/lea-ypi-hannah-arendt-odulu-2026" },
  { date: "2026-10-01", precision: "month", award: "MacArthur Fellowship", laureate: "Felipe De Brigard", kind: "Duyuru", note: "800 bin dolar", href: "/haber/felipe-de-brigard-macarthur-fellow-2026-hafiza-hayal-gucu" },
  { date: "2026-10-01", precision: "month", award: "Dennett Ödülü", laureate: "Nicholas Humphrey", kind: "Duyuru", note: "ICCS · 10 bin dolar · tören Roma'da", href: "/haber/oduller-leverhulme-2026-dennett-humphrey-silverman-adams" },
  { date: "2026-10-01", precision: "month", award: "Hugh J. Silverman Kitap Ödülü", laureate: "V. Joshua Adams", kind: "Duyuru", note: "Felsefe ve edebiyat", href: "/haber/oduller-leverhulme-2026-dennett-humphrey-silverman-adams" },
  { date: "2026-10-21", award: "Philip Leverhulme Ödülleri (Felsefe)", laureate: "Josh Milburn, Katharine Jenkins", kind: "Duyuru", note: "100 bin sterlin", href: "/haber/oduller-leverhulme-2026-dennett-humphrey-silverman-adams" },
  { date: "2026-11-03", award: "Prix lycéen du livre de philosophie", laureate: "Antoine Vuille", kind: "Tören", note: "Paris, Bibliothèque nationale de France", href: "/haber/oduller-lakatos-2026-norton-prix-lyceen-vuille" },
  { date: "2026-11-04", award: "Nayef Al-Rodhan Ödülü", laureate: "Pinotti · Turello · Owen (kısa liste)", kind: "Açıklanacak", note: "Royal Institute of Philosophy", href: "/haber/nayef-al-rodhan-odulu-2026-uzun-liste" },
  { date: "2026-11-10", award: "Kyoto Ödülü (Sanat ve Felsefe)", laureate: "Laurie Anderson", kind: "Tören", note: "Kyoto", href: "/haber/kyoto-odulu-2026-laurie-anderson" },
  { date: "2026-11-17", award: "Du Châtelet Fizik Felsefesi Ödülü", laureate: "Qiu Lin", kind: "Atölye", note: "Duke Üniversitesi", href: "/haber/oduller-du-chatelet-2026-qiu-lin-psa-bilim-felsefesi-irk-odulu" },
  { date: "2026-11-19", award: "PSA Bilim Felsefesi ve Irk Ödülü", laureate: "Açıklanacak", kind: "Açıklanacak", note: "PSA2026, San Diego, 19-22 Kasım", href: "/haber/oduller-du-chatelet-2026-qiu-lin-psa-bilim-felsefesi-irk-odulu" },
  { date: "2026-12-06", award: "31. Türkiye Felsefe Olimpiyadı", laureate: "Lise öğrencileri", kind: "Yarışma", note: "Türkiye Felsefe Kurumu · 11 ilde çevrim içi", href: "/etkinlik/turkiye-felsefe-olimpiyadi-31-2026" },
  { date: "2026-12-10", award: "Hannah Arendt Siyasi Düşünce Ödülü", laureate: "Lea Ypi", kind: "Tören", note: "Bremen", href: "/haber/lea-ypi-hannah-arendt-odulu-2026" },
];
