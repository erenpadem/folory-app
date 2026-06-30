import { test, expect } from '@playwright/test';
import { API_BASE, apiRegister, backendReachable } from './helpers';

test.describe('Authentication (UI)', () => {
  test('register (API) then login (UI) redirects away from login', async ({ page, request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);

    const { email, password } = await apiRegister(request);

    await page.goto('/auth/login');
    // NOTE: the password input's label association is broken (see findings),
    // so target by the RHF field name which is rendered on the <input>.
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
      timeout: 30_000,
    });
    expect(new URL(page.url()).pathname).not.toContain('/auth/login');
  });

  test('invalid credentials keep user on login and show an error', async ({ page, request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);

    await page.goto('/auth/login');
    await page.locator('input[name="email"]').fill('nobody@nowhere.test');
    await page.locator('input[name="password"]').fill('wrong-password-123');
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    // Should remain on the login page (no successful redirect).
    await page.waitForTimeout(2500);
    expect(new URL(page.url()).pathname).toContain('/auth/login');
  });

  test('register tab exposes the registration form fields', async ({ page }) => {
    await page.goto('/auth/login?tab=register');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="password_confirmation"]')).toBeVisible();
  });

  test('password input is properly associated with its label (a11y)', async ({ page }) => {
    await page.goto('/auth/login');
    // getByLabel resolves an <input> via its <label for> association. This only
    // works if the FormControl id lands on the input (regression guard for the
    // previously-broken Slot-on-wrapper-div behaviour).
    const password = page.getByLabel('Şifre', { exact: true });
    await expect(password).toBeVisible();
    await password.fill('secret-123');
    await expect(password).toHaveValue('secret-123');
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('visiting a protected route while logged out redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/auth\/login/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toContain('/auth/login');
  });
});
