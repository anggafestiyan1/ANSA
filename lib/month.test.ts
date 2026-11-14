import { describe, expect, it } from 'vitest';
import { currentMonth, dayLabel, daysInMonth, monthLabel, normalizeMonth, rupiah, shiftMonth } from './month';

describe('month', () => {
  it('bulan berjalan memakai jam Jakarta, bukan UTC', () => {
    // 31 Okt 2026 17.30 UTC = 1 Nov 2026 00.30 WIB
    expect(currentMonth(new Date('2026-10-31T17:30:00Z'))).toBe('2026-11');
    expect(currentMonth(new Date('2026-10-31T16:59:00Z'))).toBe('2026-10');
  });

  it('normalizeMonth menerima YYYY-MM sah saja', () => {
    const now = new Date('2026-11-14T03:00:00Z');
    expect(normalizeMonth('2026-02', now)).toBe('2026-02');
    for (const bad of [undefined, '', '2026-13', '2026-1', "2026-11'; drop"]) expect(normalizeMonth(bad, now)).toBe('2026-11');
  });

  it('geser bulan melewati tahun', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('jumlah hari', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2028-02')).toBe(29);
    expect(daysInMonth('2026-11')).toBe(30);
  });

  it('label', () => {
    expect(monthLabel('2026-11')).toBe('November 2026');
    expect(monthLabel('2026-11', false)).toBe('November');
    const now = new Date('2026-11-14T03:00:00Z');
    expect(dayLabel(new Date('2026-11-14T00:10:00Z'), now)).toBe('Hari ini');
    expect(dayLabel(new Date('2026-11-13T10:00:00Z'), now)).toBe('Kemarin');
    expect(dayLabel(new Date('2026-11-02T10:00:00Z'), now)).toBe('2 Nov');
    expect(rupiah(1500000)).toBe('Rp1.500.000');
  });
});
