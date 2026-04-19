import { describe, expect, it } from 'vitest';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  VerifyEmailSchema,
} from '@/lib/validations/auth';

describe('auth validation schemas', () => {
  it('LoginSchema accepts valid credentials', () => {
    const parsed = LoginSchema.parse({
      email: 'a@b.com',
      password: 'secret1',
      remember: false,
    });
    expect(parsed.email).toBe('a@b.com');
  });

  it('RegisterSchema rejects mismatched passwords', () => {
    expect(() =>
      RegisterSchema.parse({
        name: 'Test',
        email: 'a@b.com',
        password: 'secret1',
        password_confirmation: 'other',
      })
    ).toThrow();
  });

  it('ForgotPasswordSchema accepts email', () => {
    const r = ForgotPasswordSchema.parse({ email: 'x@y.com' });
    expect(r.email).toBe('x@y.com');
  });

  it('VerifyEmailSchema enforces 6-digit code', () => {
    expect(() => VerifyEmailSchema.parse({ code: '12' })).toThrow();
    expect(VerifyEmailSchema.parse({ code: '123456' }).code).toBe('123456');
  });
});
