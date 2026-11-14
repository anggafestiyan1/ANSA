// Membuat akun (atau mengganti nama/password kalau email sudah ada). Jalankan: npm run user:create
// Password diketik di terminal sendiri dan hanya disimpan sebagai hash.
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import nextEnv from '@next/env';
import pg from 'pg';
import { hashPassword } from '../lib/password.ts';

nextEnv.loadEnvConfig(process.cwd()); // file env sama dengan yang dibaca Next
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL belum diisi di .env.local');
  process.exit(1);
}

// Ketikan password tidak ditampilkan: output readline dibisukan selama pertanyaan password.
let muted = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk, encoding);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });

async function secret(label: string): Promise<string> {
  const answer = rl.question(label); // label sudah tercetak sebelum dibisukan
  muted = true;
  const value = await answer;
  muted = false;
  process.stdout.write('\n');
  return value;
}

const name = (await rl.question('Nama tampilan (mis. Suami): ')).trim();
const email = (await rl.question('Email: ')).trim().toLowerCase();
const password = await secret('Password (min 8 karakter): ');
const again = await secret('Ulangi password: ');
rl.close();

if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Nama wajib diisi dan email harus valid.');
  process.exit(1);
}
if (password.length < 8 || password !== again) {
  console.error('Password minimal 8 karakter dan kedua ketikan harus sama.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  const { rows } = await client.query<{ id: number; created: boolean }>(
    `insert into users (name, email, password_hash) values ($1, $2, $3)
     on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash
     returning id, (xmax = 0) as created`,
    [name, email, await hashPassword(password)],
  );
  console.log(`${rows[0].created ? 'Akun dibuat' : 'Akun diperbarui'}: ${name} <${email}> (id ${rows[0].id})`);
} finally {
  await client.end();
}
