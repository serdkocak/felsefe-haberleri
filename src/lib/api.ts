import { NextResponse } from "next/server";

/**
 * Tüm /api uçlarının ortak yanıt zarfı.
 * Mobil istemcinin (Flutter) tek bir çözümleyici yazması için sözleşme sabittir.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: { code: string; message: string };
};

/**
 * Salt okunur GET uçları için yanıt başlıkları: Vercel'in kenar önbelleği (CDN)
 * yanıtı 10 dakika saklar, sonraki 1 saat eskisini verirken arkada tazeler.
 * Böylece aynı isteğe her seferinde fonksiyon çalıştırılıp veritabanına gidilmez.
 * Yazma uçlarında (abone, mesaj, yorum) KULLANILMAZ.
 */
export const PUBLIC_CACHE: ResponseInit = {
  headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
};

export function jsonOk<T>(
  data: T,
  meta?: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, init);
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/** Query string'den güvenli pozitif tam sayı okur. */
export function readInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
