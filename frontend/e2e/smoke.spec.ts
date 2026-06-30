import { test, expect } from '@playwright/test';

test.describe('Smoke (UI shell)', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fo-lory|Next/i);
  });

  test('login page shows Fo-lory and tabs', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: /^Fo-lory$/ })
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Giriş Yap' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Kayıt Ol' })).toBeVisible();
  });

  test('explore page renders search', async ({ page }) => {
    await page.goto('/explore');
    await expect(
      page.getByPlaceholder('Kitap, yazar veya kategori ara...')
    ).toBeVisible({ timeout: 15_000 });
  });
});
