// Uji integrasi ke PostgreSQL sungguhan. Jalan hanya kalau TEST_DATABASE_URL diisi, mis.:
//   TEST_DATABASE_URL=postgres://... npm test
// Setiap run memakai schema sementara sendiri lalu menghapusnya.
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const url = process.env.TEST_DATABASE_URL;
const schema = `uji_${process.pid}_${Date.now()}`;

describe.skipIf(!url)('expenses (database)', () => {
  let lib: typeof import('./expenses');
  let db: typeof import('./db').db;
  const suami = { id: 0, name: 'Suami' };
  const istri = { id: 0, name: 'Istri' };

  beforeAll(async () => {
    process.env.DATABASE_URL = `${url}${url!.includes('?') ? '&' : '?'}options=-c%20search_path%3D${schema}`;
    db = (await import('./db')).db;
    lib = await import('./expenses');
    await db.query(`create schema ${schema}`);
    await db.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
    const { rows } = await db.query<{ id: number }>(
      `insert into users (name, email, password_hash) values ('Suami', 's@uji', 'x'), ('Istri', 'i@uji', 'x') returning id`,
    );
    suami.id = rows[0].id;
    istri.id = rows[1].id;
  });

  afterAll(async () => {
    await db?.query(`drop schema if exists ${schema} cascade`);
    await db?.end();
  });

  it('mencatat, membaca ulang teks di server, dan menandai Bersama', async () => {
    const a = await lib.addEntry(suami, '15k kopi', 'ketik');
    const b = await lib.addEntry(suami, 'b 50rb sayur', 'suara');
    expect(a).toMatchObject({ amount: 15000, note: 'kopi', shared: false, canceled: false });
    expect(b).toMatchObject({ amount: 50000, note: 'sayur', shared: true, source: 'suara' });
    expect(await lib.addEntry(suami, 'makan', 'ketik')).toBeNull();
    expect((await lib.myRecent(suami)).map((e) => e.rawText)).toEqual(['15k kopi', 'b 50rb sayur']);
    expect(await lib.myRecent(istri)).toEqual([]);
  });

  it('Batal hanya untuk catatan sendiri atau Bersama, dan Urungkan mengembalikan', async () => {
    const pribadi = (await lib.addEntry(suami, '10k parkir', 'ketik'))!;
    const bersama = (await lib.addEntry(suami, 'b 20k galon', 'ketik'))!;
    expect(await lib.setCanceled(istri, pribadi.id, true)).toBeNull();
    expect(await lib.setCanceled(istri, bersama.id, true)).toMatchObject({ canceled: true });
    expect(await lib.setCanceled(istri, bersama.id, false)).toMatchObject({ canceled: false });
    expect(await lib.setCanceled(suami, pribadi.id, true)).toMatchObject({ canceled: true });
  });

  it('total dan dashboard memakai batas bulan WIB dan mengabaikan yang dibatalkan', async () => {
    await db.query('delete from expenses');
    const insert = (amount: number, owner: number | null, at: string, canceled = false) =>
      db.query(
        `insert into expenses (amount, owner_user_id, created_by, raw_text, source, created_at, canceled_at)
         values ($1, $2, $3, 'uji', 'ketik', $4, $5)`,
        [amount, owner, suami.id, at, canceled ? at : null],
      );
    await insert(1000, suami.id, '2026-10-31T16:59:00Z'); // 31 Okt 23.59 WIB: Oktober
    await insert(2000, suami.id, '2026-10-31T17:00:00Z'); // 1 Nov 00.00 WIB: November
    await insert(3000, istri.id, '2026-11-14T03:00:00Z');
    await insert(4000, null, '2026-11-14T04:00:00Z');
    await insert(9000, null, '2026-11-14T05:00:00Z', true);

    expect(await lib.monthTotal('2026-10')).toBe(1000);
    expect(await lib.monthTotal('2026-11')).toBe(9000);

    const d = await lib.dashboard('2026-11', 'semua', 30);
    expect(d.total).toBe(9000);
    expect(d.shared).toBe(4000);
    expect(d.users.map((u) => u.total)).toEqual([2000, 3000]);
    expect(d.daily[0]).toBe(2000);
    expect(d.daily[13]).toBe(7000);
    expect(d.recent).toHaveLength(3);

    const hanyaBersama = await lib.dashboard('2026-11', 'bersama', 30);
    expect(hanyaBersama.daily[13]).toBe(4000);
    expect(hanyaBersama.recent.map((r) => r.owner)).toEqual([null]);
    const hanyaIstri = await lib.dashboard('2026-11', String(istri.id), 30);
    expect(hanyaIstri.recent.map((r) => r.amount)).toEqual([3000]);
    expect(hanyaIstri.total).toBe(9000); // ringkasan tetap semua pemilik
  });
});
