import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LEN = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LEN, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

/** Hasil: "scrypt$<salt hex>$<hash hex>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${(await derive(password, salt)).toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== KEY_LEN) return false;
  return timingSafeEqual(await derive(password, Buffer.from(salt, 'hex')), expected);
}
