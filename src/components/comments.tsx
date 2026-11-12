"use client";

import { useEffect, useRef, useState } from "react";

type ApiComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  parentId: string | null;
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Haber altındaki yorum bölümü.
 *
 * Üyelik gerekmez: ad ve e-posta boş bırakılabilir, yorum "Anonim" olarak yayımlanır.
 * E-posta verilirse yayımlanmaz; yalnızca yönetim görebilir.
 */
export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [replyTo, setReplyTo] = useState<ApiComment | null>(null);

  const [form, setForm] = useState({ authorName: "", email: "", body: "", website: "" });

  // Yorumlar yalnızca bölüm ekrana girince yüklenir: çoğu okur yazının sonuna
  // inmez; her sayfa görüntülemesinde sunucuya istek gitmesi boşuna CPU harcar.
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;

    fetch(`/api/posts/${slug}/comments`)
      .then((response) => response.json())
      .then((json) => {
        if (active && json?.success) setComments(json.data ?? []);
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug, visible]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: replyTo?.id ?? null }),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        setNotice({ kind: "error", text: json?.error?.message ?? "Yorum gönderilemedi." });
        return;
      }

      if (json.data) setComments((current) => [...current, json.data as ApiComment]);

      setNotice({ kind: "ok", text: json.meta?.message ?? "Yorumunuz alındı." });
      setForm({ authorName: "", email: "", body: "", website: "" });
      setReplyTo(null);
    } catch {
      setNotice({ kind: "error", text: "Bağlantı hatası. Lütfen tekrar deneyin." });
    } finally {
      setSending(false);
    }
  }

  const roots = comments.filter((comment) => !comment.parentId);
  const repliesOf = (id: string) => comments.filter((comment) => comment.parentId === id);

  return (
    <section id="yorumlar" ref={sectionRef} className="mt-16 border-t border-line pt-10">
      <div className="flex items-center gap-4 border-b-2 border-ink pb-2">
        <h2 className="font-serif text-lg font-bold tracking-wide">Yorumlar</h2>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <span className="text-xs text-muted">{comments.length}</span>
      </div>

      {/* ------------------------- Liste ------------------------- */}
      {loading ? (
        <p className="mt-6 text-sm text-muted">Yorumlar yükleniyor…</p>
      ) : roots.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Henüz yorum yok. Bu haber hakkındaki ilk düşünceyi siz yazın.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {roots.map((comment) => (
            <li key={comment.id}>
              <CommentBody comment={comment} onReply={() => setReplyTo(comment)} />

              {repliesOf(comment.id).length > 0 && (
                <ul className="mt-4 space-y-4 border-l-2 border-line pl-5">
                  {repliesOf(comment.id).map((reply) => (
                    <li key={reply.id}>
                      <CommentBody comment={reply} onReply={() => setReplyTo(comment)} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ------------------------- Form ------------------------- */}
      <form onSubmit={submit} className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <p className="font-serif text-base font-bold">
          {replyTo ? `${replyTo.authorName} kişisine yanıt` : "Yorum yazın"}
        </p>

        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="mt-1 text-xs text-accent hover:underline"
          >
            Yanıtı iptal et
          </button>
        )}

        <p className="mt-2 text-xs leading-relaxed text-muted">
          Üyelik gerekmez. Ad ve e-posta alanlarını boş bırakırsanız yorumunuz{" "}
          <strong>Anonim</strong> olarak yayımlanır. E-posta yayımlanmaz.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={form.authorName}
            onChange={(event) => setForm({ ...form, authorName: event.target.value })}
            placeholder="Adınız (isteğe bağlı)"
            maxLength={60}
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="E-posta (isteğe bağlı, yayımlanmaz)"
            maxLength={254}
            className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <textarea
          value={form.body}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
          placeholder="Düşünceniz…"
          required
          rows={5}
          maxLength={2000}
          className="mt-3 w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-accent"
        />

        {/* Bot tuzağı: gerçek kullanıcı bu alanı göremez. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => setForm({ ...form, website: event.target.value })}
          className="hidden"
          aria-hidden
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={sending || form.body.trim().length < 3}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "Gönderiliyor…" : "Yorumu gönder"}
          </button>

          <span className="text-xs text-muted">{form.body.length}/2000</span>

          {notice && (
            <span className={notice.kind === "ok" ? "text-xs text-accent" : "text-xs text-red-600"}>
              {notice.text}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function CommentBody({ comment, onReply }: { comment: ApiComment; onReply: () => void }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-serif text-sm font-bold">{comment.authorName}</span>
        <time dateTime={comment.createdAt} className="text-xs text-muted">
          {dateFormat.format(new Date(comment.createdAt))}
        </time>
      </div>

      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">{comment.body}</p>

      <button type="button" onClick={onReply} className="mt-3 text-xs text-accent hover:underline">
        Yanıtla
      </button>
    </article>
  );
}
