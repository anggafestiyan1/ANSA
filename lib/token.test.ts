import { describe, expect, it } from 'vitest';
import { decodeToken, encodeToken, MAX_AGE_SECONDS } from './token';

const SECRET = 'a'.repeat(64);

describe('token sesi', () => {
  it('bolak-balik menghasilkan userId yang sama', () => {
    expect(decodeToken(encodeToken(7, SECRET), SECRET)).toBe(7);
  });

  it('menolak token yang diubah atau rahasia lain', () => {
    const t = encodeToken(7, SECRET);
    expect(decodeToken(t.replace(/^7\./, '8.'), SECRET)).toBeNull();
    expect(decodeToken(t, 'b'.repeat(64))).toBeNull();
    expect(decodeToken(t.slice(0, -2), SECRET)).toBeNull();
  });

  it('menolak token kedaluwarsa', () => {
    const now = Date.now();
    const t = encodeToken(7, SECRET, now);
    expect(decodeToken(t, SECRET, now + (MAX_AGE_SECONDS - 1) * 1000)).toBe(7);
    expect(decodeToken(t, SECRET, now + (MAX_AGE_SECONDS + 1) * 1000)).toBeNull();
  });

  it.each([undefined, '', 'abc', '..', '0.99999999999.x'])('menolak token rusak %s', (t) => {
    expect(decodeToken(t, SECRET)).toBeNull();
  });
});
