import { test, expect } from '@playwright/test';

const apiBase = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8081';

async function backendReachable(request: import('@playwright/test').APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get(`${apiBase}/api/books`, { timeout: 5000 });
    return res.ok();
  } catch {
    return false;
  }
}

test.describe('Auth E2E (UI + API)', () => {
  test('register then login redirects to home', async ({ page, request }) => {
    test.skip(!(await backendReachable(request)), `Backend çalışmıyor: ${apiBase}`);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `e2e.${suffix}@folory.test`;
    const password = 'e2e-secret-12';

    const reg = await request.post(`${apiBase}/api/register`, {
      data: {
        name: 'E2E User',
        email,
        password,
        password_confirmation: password,
      },
      headers: { Accept: 'application/json' },
    });

    expect(reg.ok(), await reg.text()).toBeTruthy();

    await page.goto('/auth/login');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
      timeout: 45_000,
    });
  });
});
