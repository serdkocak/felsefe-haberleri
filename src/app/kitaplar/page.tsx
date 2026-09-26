import type { Metadata } from "next";

import { BookCard } from "@/components/book-card";
import { Container } from "@/components/container";
import { getBooks } from "@/lib/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Kitaplar",
  description: "Çağdaş filozofların yeni kitapları, çeviriler ve temel eserler.",
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <Container size="wide">
      <header className="border-b border-line py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Raf</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Kitaplar</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted metin-yasli">
          Yeni çıkanlar, Türkçe çeviriler ve takip ettiğimiz filozofların temel eserleri.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="py-12 text-sm text-muted">Henüz kitap kaydı yok.</p>
      ) : (
        <div className="grid gap-4 py-12 lg:grid-cols-2">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </Container>
  );
}
