import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiCreateDraftBook,
  apiDeleteBook,
  apiLogin,
  authHeaders,
  requireSeededAuthor,
  expectNoAppCrash,
  loginAs,
  SEEDED_AUTHOR,
  uniqueE2eTitle,
} from './helpers';

test.describe('Author dashboard & book management', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    await requireSeededAuthor(request);
  });

  test('dashboard books list filters draft vs published', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const draftTitle = uniqueE2eTitle('E2E Taslak Filtre');
    const draft = await apiCreateDraftBook(request, token, { title: draftTitle });

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await page.goto('/dashboard/books');
      await expect(page.getByRole('heading', { name: 'Kitaplarım' })).toBeVisible({
        timeout: 20_000,
      });

      await page.getByRole('combobox').first().click();
      await page.getByRole('option', { name: /Taslak/ }).click();
      await expect(page.getByText(draftTitle).first()).toBeVisible({ timeout: 15_000 });

      await page.getByRole('combobox').first().click();
      await page.getByRole('option', { name: /Yayında/ }).click();
      await expect(page.getByText(draftTitle)).toHaveCount(0, { timeout: 15_000 });
    } finally {
      await apiDeleteBook(request, token, draft.id);
    }
  });

  test('author can delete a draft book from dashboard (confirm by title)', async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Silinecek');
    const draft = await apiCreateDraftBook(request, token, { title });

    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard/books');

    const card = page.locator('h3', { hasText: title }).first();
    await expect(card).toBeVisible({ timeout: 20_000 });

    const bookCard = card.locator('xpath=ancestor::*[contains(@class,"rounded")]').first();
    await bookCard.getByLabel('Kitap işlemleri').click();
    await page.getByRole('menuitem', { name: 'Sil' }).click();

    await expect(page.getByText('Silmek istediğinden emin misin?')).toBeVisible();
    await page.getByPlaceholder('Kitap adını yazın').fill(title);
    const deleteReq = page.waitForResponse(
      (r) => r.url().includes(`/api/books/${draft.id}`) && r.request().method() === 'DELETE',
      { timeout: 20_000 }
    );
    await page.getByRole('button', { name: 'Evet' }).click();
    await deleteReq;

    await expect(page.getByText(title)).toHaveCount(0, { timeout: 15_000 });

    const check = await request.get(`${API_BASE}/api/books/${draft.slug}`, {
      headers: authHeaders(token),
    });
    expect(check.status()).toBe(404);
    await expectNoAppCrash(page);
  });

  test('author dashboard stats load', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard');
    await expect(page.getByText(/Kitaplarım|Toplam kitap|Yayında/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expectNoAppCrash(page);
  });

  test('author dashboard comments and ratings tabs render', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('tab', { name: /Yorumlar/ }).click();
    await expect(page.getByText(/Yorum|Henüz/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: 'Puanlar' }).click();
    await expect(page.getByText(/Puan|Henüz|Ortalama/i).first()).toBeVisible({ timeout: 15_000 });
    await expectNoAppCrash(page);
  });

  test('author can open edit wizard for an existing draft', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Düzenle');
    const draft = await apiCreateDraftBook(request, token, { title });

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await page.goto(`/dashboard/books/update/${draft.slug}`);
      await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });
      await expect(page.getByLabel('Kitap Başlığı *')).toHaveValue(title);

      const newTitle = `${title} — güncellendi`;
      await page.getByLabel('Kitap Başlığı *').fill(newTitle);
      const savePromise = page.waitForResponse(
        (r) => r.url().includes('/api/books/draft') && r.ok(),
        { timeout: 30_000 }
      );
      await page.getByRole('button', { name: 'İleri' }).click();
      await savePromise.catch(() => {
        /* may already be on step 2 */
      });

      const meRes = await request.get(`${API_BASE}/api/books/me?search=${encodeURIComponent(newTitle)}`, {
        headers: authHeaders(token),
      });
      expect(meRes.ok()).toBeTruthy();
      const books = (await meRes.json()).data ?? [];
      expect(books.some((b: { title: string }) => b.title === newTitle)).toBeTruthy();
    } finally {
      await apiDeleteBook(request, token, draft.id);
    }
  });
});
