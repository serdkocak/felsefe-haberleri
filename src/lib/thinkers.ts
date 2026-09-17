/**
 * Sayfanın en üstündeki portre şeridinde görünen düşünürler.
 *
 * DİZİLİM
 * Toplam 13 portre: 6 sol — 1 merkez — 6 sağ. Hepsi eşit genişliktedir, bu yüzden
 * merkezdeki portre (Nietzsche) her ekran genişliğinde tam ortada kalır; hemen
 * solunda Spinoza, hemen sağında Kant durur.
 *
 * KIRPMA
 * Şerit geniş ve alçak, portreler ise dikey olduğu için görseller kırpılır.
 * `focus` alanı hangi noktanın merkezde kalacağını söyler (CSS object-position).
 * İkinci değer küçüldükçe üst taraf, büyüdükçe alt taraf görünür:
 *   "center 20%" → yüz yukarıda olan boy fotoğrafları
 *   "center 40%" → yüzü kadraja yakın portreler ve büstler
 * Bir portrenin kafası kesik görünüyorsa yalnızca bu değeri değiştirmek yeterli.
 *
 * GÖRSELLER
 * Wikimedia Commons üzerindeki kamuya açık ya da serbest lisanslı eserler.
 * `Special:FilePath` dosyayı doğrudan sunar, `width` küçültülmüş sürüm döndürür.
 * Yüklenemeyen portre için önce `altImage` denenir; o da olmazsa kutu sessizce
 * koyu bir doku olarak kalır ve şeridin düzeni bozulmaz.
 */
export type Thinker = {
  name: string;
  /** Erişilebilirlik metni ve fareyle üzerine gelince görünen ipucu için. */
  era: string;
  image: string;
  /** Birincisi yüklenmezse denenecek ikinci dosya. */
  altImage?: string;
  /** CSS object-position değeri — kadrajda yüzün nereye geleceğini belirler. */
  focus: string;
  link: string;
};

const commons = (file: string, width = 500) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

/** Merkezin solundaki portreler — sondaki Spinoza, Nietzsche'nin hemen solunda. */
export const leftThinkers: Thinker[] = [
  {
    name: "Sokrates",
    era: "MÖ 5. yy",
    image: commons("Socrates_Louvre.jpg"),
    focus: "center 38%",
    link: "https://tr.wikipedia.org/wiki/Sokrates",
  },
  {
    name: "Platon",
    era: "MÖ 4. yy",
    image: commons("Plato_Silanion_Musei_Capitolini_MC1377.jpg"),
    focus: "center 40%",
    link: "https://tr.wikipedia.org/wiki/Platon",
  },
  {
    name: "Aristoteles",
    era: "MÖ 4. yy",
    image: commons("Aristotle_Altemps_Inv8575.jpg"),
    focus: "center 32%",
    link: "https://tr.wikipedia.org/wiki/Aristoteles",
  },
  {
    name: "Descartes",
    era: "17. yy",
    image: commons("Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg"),
    focus: "center 30%",
    link: "https://tr.wikipedia.org/wiki/Ren%C3%A9_Descartes",
  },
  {
    name: "Hume",
    era: "18. yy",
    image: commons("Painting_of_David_Hume.jpg"),
    altImage: commons("David_Hume.jpg"),
    focus: "center 28%",
    link: "https://tr.wikipedia.org/wiki/David_Hume",
  },
  {
    name: "Spinoza",
    era: "17. yy",
    image: commons("Spinoza.jpg"),
    focus: "center 32%",
    link: "https://tr.wikipedia.org/wiki/Baruch_Spinoza",
  },
];

/** Şeridin tam ortasındaki portre. */
export const centerThinker: Thinker = {
  name: "Nietzsche",
  era: "19. yy",
  image: commons("Nietzsche187a.jpg", 600),
  focus: "center 35%",
  link: "https://tr.wikipedia.org/wiki/Friedrich_Nietzsche",
};

/** Merkezin sağındaki portreler — baştaki Kant, Nietzsche'nin hemen sağında. */
export const rightThinkers: Thinker[] = [
  {
    name: "Kant",
    era: "18. yy",
    image: commons("Immanuel_Kant_(painted_portrait).jpg"),
    focus: "center 30%",
    link: "https://tr.wikipedia.org/wiki/Immanuel_Kant",
  },
  {
    name: "Hegel",
    era: "19. yy",
    image: commons("Hegel_portrait_by_Schlesinger_1831.jpg"),
    focus: "center 28%",
    link: "https://tr.wikipedia.org/wiki/Georg_Wilhelm_Friedrich_Hegel",
  },
  {
    name: "Marx",
    era: "19. yy",
    image: commons("Karl_Marx_001.jpg"),
    focus: "center 24%",
    link: "https://tr.wikipedia.org/wiki/Karl_Marx",
  },
  {
    name: "Sartre",
    era: "20. yy",
    image: commons("Jean-Paul_Sartre_FP.JPG"),
    altImage: commons("Jean_Paul_Sartre_1965.jpg"),
    focus: "center 26%",
    link: "https://tr.wikipedia.org/wiki/Jean-Paul_Sartre",
  },
  {
    name: "Simone de Beauvoir",
    era: "20. yy",
    // 1955, Pekin — 47 yaşında; eski 1967 portresi yedekte.
    image: commons("Simone_de_Beauvoir_in_Beijing_1955.jpg"),
    altImage: commons("Simone_de_Beauvoir_1967_(cropped).jpg"),
    focus: "center 28%",
    link: "https://tr.wikipedia.org/wiki/Simone_de_Beauvoir",
  },
  {
    name: "Hannah Arendt",
    era: "20. yy",
    // 1933 — 27 yaşında; eski 1975 portresi yedekte.
    image: commons("Hannah_Arendt_1933.jpg"),
    altImage: commons("Hannah_Arendt_1975_(cropped).jpg"),
    focus: "center 35%",
    link: "https://tr.wikipedia.org/wiki/Hannah_Arendt",
  },
];

/** Tüm portreler, soldan sağa sırayla. */
export const thinkers: Thinker[] = [...leftThinkers, centerThinker, ...rightThinkers];
