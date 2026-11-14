import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { decodeToken, encodeToken, MAX_AGE_SECONDS } from './token';

export type User = { id: number; name: string };

const COOKIE = 'ansa_session';

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET belum diisi (minimal 32 karakter).');
  return s;
}

export async function startSession(userId: number): Promise<void> {
  (await cookies()).set(COOKIE, encodeToken(userId, secret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const id = decodeToken((await cookies()).get(COOKIE)?.value, secret());
  if (!id) return null;
  const { rows } = await db.query<User>('select id, name from users where id = $1', [id]);
  return rows[0] ?? null;
}

/** Untuk halaman dan aksi server: tanpa sesi sah langsung ke /login. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}
