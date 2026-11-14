'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { endSession, startSession } from '@/lib/session';

export type LoginState = { error: string; email: string } | null;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { error: 'Isi email dan password.', email };

  const { rows } = await db.query<{ id: number; password_hash: string }>(
    'select id, password_hash from users where email = $1',
    [email],
  );
  if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) {
    // shortcut: jeda per percobaan, bukan kunci akun; cukup untuk 2 akun, tambah rate limit kalau pengguna bertambah.
    await new Promise((r) => setTimeout(r, 1000));
    return { error: 'Email atau password salah.', email };
  }
  await startSession(rows[0].id);
  redirect('/');
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/login');
}
