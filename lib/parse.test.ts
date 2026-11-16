import { describe, expect, it } from 'vitest';
import { parse } from './parse';

describe('parse', () => {
  it.each([
    // [input, nominal, catatan, bersama]
    ['15k', 15000, '', false],
    ['15', 15000, '', false],
    ['15rb', 15000, '', false],
    ['15 ribu kopi', 15000, 'kopi', false],
    ['15.000', 15000, '', false],
    ['Rp15.000 parkir', 15000, 'parkir', false],
    ['2000 parkir', 2000, 'parkir', false],
    ['-15k', 15000, '', false],
    ['lima belas ribu', 15000, '', false],
    ['limabelasribu', 15000, '', false],
    ['lima belas', 15000, '', false],
    ['sebelas ribu', 11000, '', false],
    ['sembilan puluh sembilan ribu', 99000, '', false],
    ['bensin dua puluh lima ribu', 25000, 'bensin', false],
    ['seratus dua puluh ribu belanja', 120000, 'belanja', false],
    ['dua ratus lima puluh ribu', 250000, '', false],
    ['2 ratus ribu', 200000, '', false],
    ['seribu', 1000, '', false],
    ['sejuta', 1000000, '', false],
    ['seribu lima ratus', 1500, '', false],
    ['lima belas enam ratus', 15600, '', false],
    ['lima belas enam ratus kopi', 15600, 'kopi', false],
    ['dua puluh lima lima ratus', 25500, '', false],
    ['lima belas enam ratus lima puluh', 15650, '', false],
    ['seratus dua puluh', 120000, '', false],
    ['sejuta lima ratus ribu', 1500000, '', false],
    ['sejuta lima ratus', 1000500, '', false], // harfiah, keputusan user 2026-11-16
    ['1,5jt kontrakan', 1500000, 'kontrakan', false],
    ['1,5 juta', 1500000, '', false],
    ['satu setengah juta kulkas', 1500000, 'kulkas', false],
    ['setengah juta', 500000, '', false],
    ['b 15k sayur', 15000, 'sayur', true],
    ['b15k sayur', 15000, 'sayur', true],
    ['belanja 50.000 sayur', 50000, 'sayur', true],
    ['Be lima puluh ribu sayur', 50000, 'sayur', true],
    ['bensin 25k', 25000, 'bensin', false],
    ['beli 15k pulsa', 15000, 'beli pulsa', false],
  ] as const)('%s', (input, amount, note, shared) => {
    expect(parse(input)).toEqual({ amount, note, shared });
  });

  it.each(['makan', '', '   ', 'b sayur', '0', '0k kopi', 'nol ribu'])('menolak "%s"', (input) => {
    expect(parse(input)).toBeNull();
  });

  it('menolak nominal di atas batas', () => {
    expect(parse('2000 juta')).toBeNull();
    expect(parse('1000 juta')).toEqual({ amount: 1_000_000_000, note: '', shared: false });
  });
});
