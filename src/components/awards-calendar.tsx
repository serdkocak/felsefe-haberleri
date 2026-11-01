import Link from "next/link";

import { awardsCalendar, type AwardEntry } from "@/data/awards-calendar";
import { cn } from "@/lib/utils";

/** Yaklaşan sayılacak gün aralığı. */
const UPCOMING_WINDOW_DAYS = 30;

type Status = "past" | "upcoming" | "later";

const dayFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric" });
const monthShort = new Intl.DateTimeFormat("tr-TR", { month: "short" });
const monthLong = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function statusOf(entry: AwardEntry, today: Date): Status {
  const date = parseDate(entry.date);
  // Ay hassasiyetli kayıtlar ayın sonuna kadar "geçmemiş" sayılır.
  const effective =
    entry.precision === "month"
      ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
      : date;
  const diffDays = Math.floor((effective.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "past";
  if (diffDays <= UPCOMING_WINDOW_DAYS) return "upcoming";
  return "later";
}

const KIND_STYLES: Record<AwardEntry["kind"], string> = {
  Duyuru: "border-line text-muted",
  Tören: "border-accent/40 text-accent",
  "Kısa liste": "border-line text-muted",
  Atölye: "border-accent/40 text-accent",
  Açıklanacak: "border-accent/40 text-accent",
  Yarışma: "border-line text-muted",
};

/**
 * Ödül takvimi — zaman çizelgesi.
 * Geçmiş anlar soluk, önümüzdeki 30 gün içindekiler vurgulu, ileri tarihler normal.
 * Bugünün konumu çizelgede ince bir "bugün" ayracıyla işaretlenir.
 */
export function AwardsCalendar({ now = new Date() }: { now?: Date }) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const entries = [...awardsCalendar].sort((a, b) => a.date.localeCompare(b.date));

  const past = entries.filter((e) => statusOf(e, today) === "past");
  const future = entries.filter((e) => statusOf(e, today) !== "past");

  return (
    <section aria-labelledby="odul-takvimi" className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Takvim</p>
          <h2 id="odul-takvimi" className="mt-1 font-serif text-xl font-bold">
            Ödül Takvimi 2026
          </h2>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden /> Yaklaşan (30 gün)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full border border-ink" aria-hidden /> İleri tarih
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-line" aria-hidden /> Verildi
          </li>
        </ul>
      </div>

      <ol className="relative mt-5 space-y-1 before:absolute before:top-0 before:bottom-0 before:left-[27px] before:w-px before:bg-line sm:before:left-[31px]">
        {past.map((entry, i) => (
          <AwardRow key={`${entry.date}-${entry.award}-${i}`} entry={entry} status="past" />
        ))}

        {/* Bugün ayracı */}
        <li className="relative flex items-center gap-3 py-2 pl-[22px] sm:pl-[26px]" aria-label="Bugün">
          <span className="relative z-10 inline-block h-3 w-3 rounded-full border-2 border-accent bg-paper" aria-hidden />
          <span className="h-px flex-1 bg-accent/50" aria-hidden />
          <span className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
            Bugün · {dayFormat.format(today)} {monthLong.format(today)}
          </span>
        </li>

        {future.map((entry, i) => (
          <AwardRow key={`${entry.date}-${entry.award}-${i}`} entry={entry} status={statusOf(entry, today)} />
        ))}
      </ol>
    </section>
  );
}

function AwardRow({ entry, status }: { entry: AwardEntry; status: Status }) {
  const date = parseDate(entry.date);
  const monthOnly = entry.precision === "month";

  const body = (
    <>
      {/* Tarih yaprağı */}
      <div
        className={cn(
          "relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border sm:h-16 sm:w-16",
          status === "upcoming" && "border-accent bg-accent text-paper",
          status === "later" && "border-ink bg-paper",
          status === "past" && "border-line bg-paper",
        )}
      >
        {monthOnly ? (
          <span className="text-[11px] font-semibold tracking-widest uppercase">{monthShort.format(date)}</span>
        ) : (
          <>
            <span className="font-serif text-xl leading-none font-bold">{dayFormat.format(date)}</span>
            <span className="mt-1 text-[10px] tracking-widest uppercase opacity-80">{monthShort.format(date)}</span>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1 py-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
              status === "past" ? "border-line text-muted" : KIND_STYLES[entry.kind],
            )}
          >
            {entry.kind}
          </span>
          {monthOnly && <span className="text-[11px] text-muted">{monthLong.format(date)}</span>}
        </div>
        <h3 className={cn("mt-1 font-serif text-base leading-snug font-bold", status === "upcoming" && "text-accent")}>
          {entry.award}
        </h3>
        <p className="text-sm text-ink-soft">{entry.laureate}</p>
        {entry.note && <p className="mt-0.5 text-xs text-muted">{entry.note}</p>}
      </div>
    </>
  );

  const rowClass = cn(
    "relative flex items-start gap-4 rounded-xl px-2 py-2 transition-colors",
    status === "past" && "opacity-55 hover:opacity-90",
    status === "upcoming" && "bg-accent-soft/60",
    entry.href && "hover:bg-accent-soft/40",
  );

  return (
    <li>
      {entry.href ? (
        <Link href={entry.href} className={rowClass}>
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}
