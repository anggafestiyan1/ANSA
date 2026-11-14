import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('cocok dengan password yang benar, menolak yang salah', async () => {
    const stored = await hashPassword('rekaan-123');
    expect(stored).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(await verifyPassword('rekaan-123', stored)).toBe(true);
    expect(await verifyPassword('rekaan-124', stored)).toBe(false);
  });

  it('salt acak: hash berbeda untuk password sama', async () => {
    expect(await hashPassword('sama')).not.toBe(await hashPassword('sama'));
  });

  it.each(['', 'bukan-format', 'bcrypt$aa$bb', 'scrypt$aa$'])('menolak hash rusak "%s"', async (stored) => {
    expect(await verifyPassword('apa saja', stored)).toBe(false);
  });
});
