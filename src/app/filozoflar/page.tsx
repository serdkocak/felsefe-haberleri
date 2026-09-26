import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PhilosopherCard } from "@/components/philosopher-card";
import { getPhilosophers } from "@/lib/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Filozoflar",
  description: "Sitede haberleri takip edilen çağdaş filozoflar.",
};

export default async function PhilosophersPage() {
  const philosophers = await getPhilosophers();

  return (
    <Container size="wide">
      <header className="border-b border-line py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Dizin</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Filozoflar</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted metin-yasli">
          Haberlerini izlediğimiz düşünürler. Bir isme tıklayarak filozofun künyesini —
          dönemi, akımı, çalışma alanları, temel eserleri ve kavramları — ilgili haberler ve
          kitaplarla birlikte tek sayfada görebilirsiniz.
        </p>
      </header>

      {philosophers.length === 0 ? (
        <p className="py-12 text-sm text-muted">Henüz filozof kaydı yok.</p>
      ) : (
        <div className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {philosophers.map((philosopher) => (
            <PhilosopherCard key={philosopher.id} philosopher={philosopher} />
          ))}
        </div>
      )}
    </Container>
  );
}
