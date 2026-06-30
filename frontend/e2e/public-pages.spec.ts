import { test, expect } from '@playwright/test';
import { collectPageErrors, expectNoAppCrash } from './helpers';

/**
 * Smoke coverage for every public (no-auth) route.
 * Verifies the page loads, renders its key heading/content, and does not crash.
 */

const publicRoutes: Array<{ path: string; expect: RegExp }> = [
  { path: '/', expect: /Fo-lory|hikaye|yazar/i },
  { path: '/explore', expect: /Popüler|Filtrele|Tümü/i },
  { path: '/about', expect: /Hakkımızda/i },
  { path: '/contact', expect: /İletişim|Bize Ulaşın|Mesaj/i },
  { path: '/legal/terms', expect: /Kullanım|Şartlar|Koşullar/i },
  { path: '/legal/privacy', expect: /Gizlilik/i },
  { path: '/legal/cookies', expect: /Çerez/i },
  { path: '/auth/login', expect: /Fo-lory/i },
];

for (const route of publicRoutes) {
  test(`public page loads: ${route.path}`, async ({ page }) => {
    const errors = collectPageErrors(page);
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });

    // Server should not return a 5xx
    expect(response, `No response for ${route.path}`).not.toBeNull();
    expect(response!.status(), `Bad status for ${route.path}`).toBeLessThan(500);

    await expect(page.locator('body')).toContainText(route.expect, { timeout: 15_000 });
    await expectNoAppCrash(page);

    expect(errors, `Uncaught errors on ${route.path}: ${errors.join(' | ')}`).toEqual([]);
  });
}

test('landing page has a working CTA into the app', async ({ page }) => {
  await page.goto('/');
  // The landing should link somewhere into the product (explore / login).
  const cta = page.getByRole('link').filter({ hasText: /Keşfet|Başla|Giriş|Kayıt|Explore/i }).first();
  await expect(cta).toBeVisible({ timeout: 15_000 });
});

test('login page shows Fo-lory and both auth tabs', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('tab', { name: 'Giriş Yap' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Kayıt Ol' })).toBeVisible();
});
