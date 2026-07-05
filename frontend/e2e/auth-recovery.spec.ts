import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiRegister,
  authenticate,
  backendReachable,
  requireSeededBackend,
} from './helpers';

test.describe('Auth recovery (forgot password)', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('forgot-password page renders step 1 form', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { name: 'Şifremi Unuttum' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.getByRole('button', { name: '6 haneli kod gönder' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Giriş sayfasına dön' })).toBeVisible();
  });

  test('submitting email advances to code entry step', async ({ page, request }) => {
    const { email } = await apiRegister(request);

    await page.goto('/auth/forgot-password');
    await page.locator('#email').fill(email);
    await page.getByRole('button', { name: '6 haneli kod gönder' }).click();

    await expect(page.getByRole('heading', { name: 'Kodu ve yeni şifreyi girin' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('#code')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('forgot-password API accepts unknown email without leaking', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/forgot-password`, {
      data: { email: 'nobody@folory.test' },
      headers: { Accept: 'application/json' },
    });
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('Email verification UI', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('verify-email page renders for newly registered user', async ({ page, request }) => {
    const { token } = await apiRegister(request);
    test.skip(!token, 'Register did not return token');

    await authenticate(page, token!);
    await page.goto('/auth/verify-email');

    await expect(page.getByRole('heading', { name: 'E-posta Doğrulama' })).toBeVisible();
    await expect(page.getByText(/6 haneli kodu girin/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kodu tekrar gönder' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ayarlara dön' })).toBeVisible();
  });

  test('resend verification code succeeds for unverified user', async ({ page, request }) => {
    const { token } = await apiRegister(request);
    test.skip(!token, 'Register did not return token');

    const resend = await request.post(`${API_BASE}/api/email/verification-notification`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    expect(resend.ok()).toBeTruthy();
  });
});
