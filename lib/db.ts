import pg from 'pg';

// bigint (int8) dibaca sebagai number: nominal <= Rp1 miliar dan total bulanan jauh di bawah 2^53.
pg.types.setTypeParser(20, Number);

const g = globalThis as unknown as { ansaPool?: pg.Pool };
// Satu pool per proses; disimpan di globalThis supaya hot reload dev tidak membuat pool baru.
export const db = (g.ansaPool ??= new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10_000,
}));
