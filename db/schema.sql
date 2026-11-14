-- Skema ANSA. Aman dijalankan ulang (npm run db:migrate).

create table if not exists users (
  id serial primary key,
  name text not null,                          -- tampil di aplikasi: "Suami" / "Istri"
  email text not null unique check (email = lower(email)),
  password_hash text not null                   -- format lib/password.ts
);

create table if not exists expenses (
  id bigserial primary key,
  amount bigint not null check (amount > 0 and amount <= 1000000000),  -- rupiah; batas sama dengan MAX_AMOUNT
  note text not null default '',
  owner_user_id int references users,          -- null = Bersama
  created_by int not null references users,
  raw_text text not null,                       -- teks asli yang diketik/diucapkan
  source text not null check (source in ('ketik', 'suara')),
  created_at timestamptz not null default now(),
  canceled_at timestamptz,                      -- terisi = dibatalkan, tidak dihitung; dikosongkan lagi saat Urungkan
  canceled_by int references users
);

create index if not exists expenses_created_at_idx on expenses (created_at);
