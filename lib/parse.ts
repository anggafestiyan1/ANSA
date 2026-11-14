// Membaca input pengeluaran dari ketikan atau hasil suara: "15k kopi", "lima belas ribu", "b 50rb sayur".
// Dipakai di browser (pratinjau) dan di server (sumber kebenaran sebelum disimpan).

export type Parsed = { amount: number; note: string; shared: boolean };

/** Batas per catatan, mencegah salah ketik ekstrem. */
export const MAX_AMOUNT = 1_000_000_000;

const DIG: Record<string, number> = {
  nol: 0, satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
};
const PIECE = /sembilan|satu|dua|tiga|empat|lima|enam|tujuh|delapan|nol|se|belas|puluh|ratus|ribu|juta/g;
const UNIT = ['belas', 'puluh', 'ratus', 'ribu', 'juta', 'rb', 'jt', 'k'];
// Awalan "b", "be" (hasil suara), atau "belanja" = pengeluaran bersama.
const SHARED = /^\s*(?:belanja|be|b)(?=[\s\d])\s*/i;

const isDigit = (t: string) => /^\d/.test(t) || Object.hasOwn(DIG, t) || t === 'setengah';

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .flatMap((raw) => {
      const t = raw.replace(/^[-+]|^rp\.?/g, '');
      const m = t.match(/^(\d+(?:[.,]\d+)*)(k|rb|ribu|jt|juta)?$/);
      if (m) return m[2] ? [m[1], m[2]] : [m[1]];
      // "limabelasribu" -> lima belas ribu, hanya kalau seluruh kata adalah kata bilangan
      const parts = t.match(PIECE);
      if (parts && parts.join('') === t) return parts.map((p) => (p === 'se' ? 'satu' : p));
      return [t];
    })
    .filter((t) => t && t !== 'rupiah');
}

function value(run: string[]): number {
  let total = 0;
  let group = 0;
  let digit = 0;
  for (const t of run) {
    if (/^\d/.test(t)) {
      // "15.000" = pemisah ribuan; "1,5" = desimal
      group += /^\d{1,3}([.,]\d{3})+$/.test(t) ? Number(t.replace(/[.,]/g, '')) : Number(t.replace(',', '.'));
    } else if (Object.hasOwn(DIG, t)) digit = DIG[t];
    else if (t === 'setengah') { group += digit + 0.5; digit = 0; }
    else if (t === 'belas') { group += digit + 10; digit = 0; }
    // "dua puluh" (kata) atau "2 puluh" (angka hasil suara)
    else if (t === 'puluh') { if (digit) group += digit * 10; else group *= 10; digit = 0; }
    else if (t === 'ratus') { if (digit) group += digit * 100; else group *= 100; digit = 0; }
    else if (t === 'ribu' || t === 'rb' || t === 'k') { total += (group + digit) * 1e3; group = digit = 0; }
    else if (t === 'juta' || t === 'jt') { total += (group + digit) * 1e6; group = digit = 0; }
  }
  const rest = group + digit;
  // Tanpa satuan, angka < 1.000 dianggap ribuan: "15" = Rp15.000.
  return Math.round(total ? total + rest : rest < 1000 ? rest * 1000 : rest);
}

/** null = tidak ada nominal yang terbaca, atau nominal di luar batas. */
export function parse(text: string): Parsed | null {
  const shared = SHARED.test(text);
  const t = tokens(text.replace(SHARED, ''));
  const s = t.findIndex(isDigit);
  if (s < 0) return null;
  let e = s;
  while (e < t.length && (isDigit(t[e]) || UNIT.includes(t[e]))) e++;
  const amount = value(t.slice(s, e));
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return null;
  return { amount, note: [...t.slice(0, s), ...t.slice(e)].join(' '), shared };
}
