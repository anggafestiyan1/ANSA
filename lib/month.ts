// Bulan dan hari selalu dihitung di zona Asia/Jakarta, bukan zona server (Vercel = UTC).
const TZ = 'Asia/Jakarta';

/** "YYYY-MM-DD" di Jakarta. */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** "YYYY-MM" di Jakarta. */
export function currentMonth(now = new Date()): string {
  return dayKey(now).slice(0, 7);
}

/** Bulan dari URL kalau formatnya benar, selain itu bulan berjalan. */
export function normalizeMonth(input: string | undefined, now = new Date()): string {
  return input && /^\d{4}-(0[1-9]|1[0-2])$/.test(input) ? input : currentMonth(now);
}

function ym(month: string): [number, number] {
  const [y, m] = month.split('-').map(Number);
  return [y, m];
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = ym(month);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = ym(month);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** "November 2026"; withYear=false -> "November". */
export function monthLabel(month: string, withYear = true): string {
  const [y, m] = ym(month);
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', month: 'long', ...(withYear && { year: 'numeric' }) })
    .format(new Date(Date.UTC(y, m - 1, 1)));
}

/** "Hari ini", "Kemarin", atau "12 Nov". */
export function dayLabel(date: Date, now = new Date()): string {
  const key = dayKey(date);
  if (key === dayKey(now)) return 'Hari ini';
  if (key === dayKey(new Date(now.getTime() - 86_400_000))) return 'Kemarin';
  return new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'short' }).format(date);
}

/** "08.12" (jam Jakarta). */
export function timeLabel(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(date);
}

export const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');
