// Membuat/memperbarui tabel dari db/schema.sql. Jalankan: npm run db:migrate
import { readFileSync } from 'node:fs';
import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd()); // file env sama dengan yang dibaca Next
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL belum diisi di .env.local');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  await client.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
  console.log('Skema siap.');
} finally {
  await client.end();
}
