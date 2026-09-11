import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyAdminPassword } from '@/lib/auth/password';

describe('password utility', () => {
  beforeEach(async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('correct-horse', 10);
  });

  it('hashPassword produces a bcrypt-verifiable hash', async () => {
    const hash = await hashPassword('my-secret');
    expect(await bcrypt.compare('my-secret', hash)).toBe(true);
  });

  it('verifyAdminPassword returns true for the correct password', async () => {
    expect(await verifyAdminPassword('correct-horse')).toBe(true);
  });

  it('verifyAdminPassword returns false for the wrong password', async () => {
    expect(await verifyAdminPassword('wrong')).toBe(false);
  });

  it('verifyAdminPassword throws if ADMIN_PASSWORD_HASH is unset', async () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    await expect(verifyAdminPassword('anything')).rejects.toThrow(/ADMIN_PASSWORD_HASH/);
  });
});
