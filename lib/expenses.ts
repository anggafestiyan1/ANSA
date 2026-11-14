import { db } from './db';
import { parse } from './parse';
import type { User } from './session';

export type Source = 'ketik' | 'suara';

export type Entry = {
  id: number;
  amount: number;
  note: string;
  shared: boolean;
  rawText: string;
  source: Source;
  createdAt: Date;
  canceled: boolean;
};

const COLS = `id, amount, note, owner_user_id is null as shared, raw_text as "rawText", source,
  created_at as "createdAt", canceled_at is not null as canceled`;

// Rentang bulan $1 ('YYYY-MM') dalam jam Jakarta.
const IN_MONTH = `created_at >= (($1::text || '-01')::timestamp at time zone 'Asia/Jakarta')
  and created_at < ((($1::text || '-01')::timestamp + interval '1 month') at time zone 'Asia/Jakarta')`;

export async function monthTotal(month: string): Promise<number> {
  const { rows } = await db.query<{ total: number }>(
    `select coalesce(sum(amount), 0)::bigint as total from expenses where canceled_at is null and ${IN_MONTH}`,
    [month],
  );
  return rows[0].total;
}

/** Catatan yang dibuat user ini, terlama di atas (urutan chat). */
export async function myRecent(user: User, limit = 100): Promise<Entry[]> {
  const { rows } = await db.query<Entry>(
    `select ${COLS} from expenses where created_by = $1 order by created_at desc, id desc limit $2`,
    [user.id, limit],
  );
  return rows.reverse();
}

/** null kalau teks tidak terbaca. Teks dibaca ulang di server; nominal dari browser tidak dipakai. */
export async function addEntry(user: User, rawText: string, source: Source): Promise<Entry | null> {
  const p = parse(rawText);
  if (!p) return null;
  const { rows } = await db.query<Entry>(
    `insert into expenses (amount, note, owner_user_id, created_by, raw_text, source)
     values ($1, $2, $3, $4, $5, $6) returning ${COLS}`,
    [p.amount, p.note, p.shared ? null : user.id, user.id, rawText, source],
  );
  return rows[0];
}

/** Batal / Urungkan. Hanya catatan milik sendiri atau Bersama; null kalau tidak boleh atau tidak ada. */
export async function setCanceled(user: User, id: number, canceled: boolean): Promise<Entry | null> {
  const { rows } = await db.query<Entry>(
    `update expenses
       set canceled_at = case when $3 then now() end, canceled_by = case when $3 then $2::int end
     where id = $1 and (owner_user_id = $2 or owner_user_id is null)
     returning ${COLS}`,
    [id, user.id, canceled],
  );
  return rows[0] ?? null;
}

export type Dashboard = {
  users: { id: number; name: string; total: number }[];
  shared: number;
  total: number;
  daily: number[]; // indeks 0 = tanggal 1
  recent: { id: number; amount: number; note: string; owner: string | null; creator: string; createdAt: Date }[];
};

/** who: 'semua' | 'bersama' | id user (string). Filter berlaku untuk grafik dan daftar, bukan ringkasan. */
export async function dashboard(month: string, who: string, days: number): Promise<Dashboard> {
  const filter = who === 'bersama' ? 'and owner_user_id is null' : /^\d+$/.test(who) ? 'and owner_user_id = $2' : '';
  const params = filter.includes('$2') ? [month, Number(who)] : [month];

  const [users, byOwner, daily, recent] = await Promise.all([
    db.query<{ id: number; name: string }>('select id, name from users order by id'),
    db.query<{ owner: number | null; total: number }>(
      `select owner_user_id as owner, sum(amount)::bigint as total from expenses
       where canceled_at is null and ${IN_MONTH} group by owner_user_id`,
      [month],
    ),
    db.query<{ day: number; total: number }>(
      `select extract(day from created_at at time zone 'Asia/Jakarta')::int as day, sum(amount)::bigint as total
       from expenses where canceled_at is null and ${IN_MONTH} ${filter} group by 1`,
      params,
    ),
    db.query<Dashboard['recent'][number]>(
      `select e.id, e.amount, e.note, o.name as owner, c.name as creator, e.created_at as "createdAt"
       from expenses e left join users o on o.id = e.owner_user_id join users c on c.id = e.created_by
       where e.canceled_at is null and ${IN_MONTH.replaceAll('created_at', 'e.created_at')}
       ${filter.replace('owner_user_id', 'e.owner_user_id')}
       order by e.created_at desc, e.id desc limit 30`,
      params,
    ),
  ]);

  const totalOf = (id: number | null) => byOwner.rows.find((r) => r.owner === id)?.total ?? 0;
  const perDay = Array<number>(days).fill(0);
  for (const r of daily.rows) perDay[r.day - 1] = r.total;
  return {
    users: users.rows.map((u) => ({ ...u, total: totalOf(u.id) })),
    shared: totalOf(null),
    total: byOwner.rows.reduce((s, r) => s + r.total, 0),
    daily: perDay,
    recent: recent.rows,
  };
}
