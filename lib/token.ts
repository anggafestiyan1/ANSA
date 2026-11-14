import { createHmac, timingSafeEqual } from 'node:crypto';

// Token sesi: "<userId>.<kedaluwarsa detik>.<HMAC-SHA256>". Tanpa tabel sesi.
// shortcut: token tidak bisa dicabut satu per satu; ganti SESSION_SECRET untuk mengeluarkan semua perangkat.

export const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 hari: di HP tidak perlu sering login ulang

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function encodeToken(userId: number, secret: string, now = Date.now()): string {
  const payload = `${userId}.${Math.floor(now / 1000) + MAX_AGE_SECONDS}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** userId kalau token sah dan belum kedaluwarsa, selain itu null. */
export function decodeToken(token: string | undefined, secret: string, now = Date.now()): number | null {
  if (!token) return null;
  const cut = token.lastIndexOf('.');
  if (cut < 0) return null;
  const payload = token.slice(0, cut);
  const given = Buffer.from(token.slice(cut + 1));
  const expected = Buffer.from(sign(payload, secret));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const [id, expires] = payload.split('.').map(Number);
  if (!Number.isInteger(id) || id <= 0 || !(expires * 1000 > now)) return null;
  return id;
}
