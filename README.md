# ANSA

Catat pengeluaran keluarga secepat ngomong. PWA: ketik atau ucapkan `15k kopi`, `b 50rb sayur` (Bersama),
lalu lihat dashboard bulanan berdua (suami dan istri, dompet bersama).

Stack: Next.js 16 (App Router) + TypeScript, PostgreSQL lewat `pg` (SQL langsung), Vitest. Hosting: Vercel + Neon.

## Struktur

| Path | Isi |
|---|---|
| `lib/parse.ts` | Membaca input ketik/suara jadi nominal + catatan + Bersama |
| `lib/expenses.ts` | Semua query pengeluaran (catat, batal, total, dashboard) |
| `lib/session.ts`, `lib/token.ts` | Sesi login: cookie httpOnly bertanda tangan HMAC |
| `lib/password.ts` | Hash password scrypt |
| `lib/month.ts` | Bulan/hari dalam jam Asia/Jakarta |
| `app/(app)/` | Layar Catat (`/`) dan Dashboard (`/dashboard`) |
| `app/login/` | Login dan logout |
| `db/schema.sql` | Skema database (aman dijalankan ulang) |
| `scripts/` | `migrate.mts` (buat tabel), `create-user.mts` (buat akun / ganti password) |

## Setup lokal

1. `npm install`
2. Salin `.env.example` jadi `.env.local`, isi `DATABASE_URL` dan `SESSION_SECRET`.
3. `npm run db:migrate`
4. `npm run user:create` (sekali per akun; password diketik di terminal, tidak tampil)
5. `npm run dev`

## Tes

- `npm test`: unit test (parser, token, password, bulan).
- Uji integrasi database ikut jalan kalau `TEST_DATABASE_URL` diisi (memakai schema sementara lalu dihapus):
  `TEST_DATABASE_URL=postgres://... npm test`

## Deploy (Vercel + Neon)

1. Neon: buat project region Singapore, salin connection string **Pooled**.
2. Dari laptop, dengan `DATABASE_URL` Neon di `.env.local`: `npm run db:migrate`, lalu `npm run user:create` untuk
   tiap akun.
3. Push repo ke GitHub, lalu di Vercel: Import project, region fungsi Singapore (`sin1`), isi Environment Variables
   `DATABASE_URL` dan `SESSION_SECRET` (nilai baru, minimal 32 karakter).
4. Buka URL Vercel di HP, login, lalu "Add to Home Screen".

Ganti `SESSION_SECRET` = semua perangkat keluar dan harus login ulang.
