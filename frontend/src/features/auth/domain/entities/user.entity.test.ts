import { describe, expect, it } from 'vitest';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('fromPrimitives maps role and verification', () => {
    const u = UserEntity.fromPrimitives({
      id: 99,
      name: 'Ada',
      email: 'a@b.com',
      email_verified_at: '2024-01-01T00:00:00.000Z',
      role: 'reader',
    });
    expect(u.id).toBe('99');
    expect(u.role).toBe('reader');
    expect(u.isEmailVerified).toBe(true);
  });

  it('isEmailVerified is false without verified_at', () => {
    const u = UserEntity.fromPrimitives({
      id: 1,
      name: 'X',
      email: 'x@y.com',
      role: 'reader',
    });
    expect(u.isEmailVerified).toBe(false);
  });
});
