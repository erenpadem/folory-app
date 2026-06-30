import { test, expect } from '@playwright/test';
import {
  API_BASE,
  backendReachable,
  expectNoAppCrash,
  getReadableBook,
  loginAs,
  SEEDED_AUTHOR,
} from './helpers';

test.describe('Authenticated journeys (author)', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('dashboard renders stats, tabs and the author books', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Toplam Kitap')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Kitaplarım' })).toBeVisible();

    // The author has seeded books -> at least one book card should be shown.
    await expect(page.locator('a[href^="/book/"], a[href^="/dashboard/books/"]').first()).toBeVisible({
      timeout: 15_000,
    });
    await expectNoAppCrash(page);
  });

  test('dashboard books list page loads', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard/books');
    await expect(page).toHaveURL(/\/dashboard\/books/, { timeout: 20_000 });
    await expectNoAppCrash(page);
  });

  test('new book wizard page loads for an author', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard/books/new');
    await expect(page).toHaveURL(/\/dashboard\/books\/new/, { timeout: 20_000 });
    // Must not bounce back to login.
    expect(new URL(page.url()).pathname).not.toContain('/auth/login');
    await expectNoAppCrash(page);
  });

  test('profile page renders the logged-in user', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).not.toContain('/auth/login');
    await expect(page.getByText(/Eren Padem|erenpadem/).first()).toBeVisible({ timeout: 15_000 });
    await expectNoAppCrash(page);
  });

  test('settings page loads with account sections', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 20_000 });
    await expect(page.getByText(/Profil|Hesap|Bildirim|Güvenlik|Ayarlar/).first()).toBeVisible({
      timeout: 15_000,
    });
    await expectNoAppCrash(page);
  });

  test('notifications page loads', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/notifications/, { timeout: 20_000 });
    await expect(page.getByText(/Bildirim/).first()).toBeVisible({ timeout: 15_000 });
    await expectNoAppCrash(page);
  });

  test('a logged-in reader can like a book', async ({ page, request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto(`/book/${book!.slug}`);

    const likeBtn = page.getByRole('button', { name: 'Beğen' });
    await expect(likeBtn).toBeVisible({ timeout: 15_000 });

    const toggle = page.waitForResponse(
      (r) => r.url().includes('/api/likes/toggle') && r.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await likeBtn.click();
    const res = await toggle;
    expect(res.ok()).toBeTruthy();
  });
});
