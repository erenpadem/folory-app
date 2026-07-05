import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiCreatePublishedBookWithTwoSections,
  apiDeleteBook,
  apiGetBook,
  apiLogin,
  authHeaders,
  clearBookEditorStorage,
  requireSeededAuthor,
  loginAs,
  SEEDED_AUTHOR,
  uniqueE2eTitle,
  waitForDraftSave,
} from './helpers';

test.describe('Published book edit wizard', () => {
  test.setTimeout(120_000);
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    await requireSeededAuthor(request);
  });

  test('book info (title, description, category) persists after step navigation', async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Yayın Bilgi');
    const book = await apiCreatePublishedBookWithTwoSections(request, token, title);

    try {
      const catRes = await request.get(`${API_BASE}/api/categories`, {
        headers: authHeaders(token),
      });
      const categories: { id: number; name: string }[] = (await catRes.json()).data ?? [];
      expect(categories.length).toBeGreaterThan(1);
      const detailBefore = await apiGetBook(request, token, book.slug);
      const altCategory = categories.find(
        (c) => c.id !== detailBefore.category_id
      ) ?? categories[1]!;

      await loginAs(page, request, SEEDED_AUTHOR);
      await clearBookEditorStorage(page);
      await page.goto(`/dashboard/books/update/${book.slug}?step=1`);
      await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });

      const newTitle = `${title} — güncellendi`;
      const newDescription = 'Yayın sonrası açıklama güncellemesi.';
      await page.getByLabel('Kitap Başlığı *').fill(newTitle);
      await page.getByLabel('Kısa Açıklama').fill(newDescription);
      await page.locator('#category').click();
      await page.getByRole('option', { name: altCategory.name }).click();

      const savePromise = waitForDraftSave(page);
      await page.getByRole('button', { name: 'İleri' }).click();
      await savePromise;

      await page.getByRole('button', { name: 'Geri' }).click();
      await expect(page.getByLabel('Kitap Başlığı *')).toHaveValue(newTitle);
      await expect(page.getByLabel('Kısa Açıklama')).toHaveValue(newDescription);
      await expect(page.locator('#category')).toContainText(altCategory.name);

      const detail = await apiGetBook(request, token, book.slug);
      expect(detail.title).toBe(newTitle);
      expect(detail.short_description).toBe(newDescription);
      expect(detail.category_id).toBe(altCategory.id);
      expect(detail.is_published).toBe(true);
    } finally {
      await apiDeleteBook(request, token, book.id);
    }
  });

  test('section rename and delete persist after navigation', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Yayın Bölüm');
    const book = await apiCreatePublishedBookWithTwoSections(request, token, title);

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await clearBookEditorStorage(page);
      await page.goto(`/dashboard/books/update/${book.slug}?step=2`);
      await expect(page.getByText('Bölümler (2)')).toBeVisible({ timeout: 30_000 });

      const rowA = page.locator('.group.relative').filter({ hasText: 'Bölüm A' });
      await rowA.locator('h3').click();
      const renameInput = rowA.locator('input');
      await renameInput.fill('Bölüm A — yeniden adlandırıldı');
      await renameInput.press('Enter');
      await waitForDraftSave(page);

      const doomedRow = page.locator('.group.relative').filter({ hasText: 'Bölüm B' });
      await doomedRow.hover();
      const deleteSave = waitForDraftSave(page);
      await doomedRow.locator('button.text-destructive').click();
      await deleteSave;
      await expect(page.getByText('Bölümler (1)')).toBeVisible({ timeout: 10_000 });

      const forwardSave = waitForDraftSave(page);
      await page.getByRole('button', { name: 'İleri' }).click();
      await forwardSave;
      await page.getByRole('button', { name: 'Geri' }).click();

      await expect(page.getByText('Bölümler (1)')).toBeVisible();
      await expect(page.getByText('Bölüm A — yeniden adlandırıldı')).toBeVisible();
      await expect(page.getByText('Bölüm B')).toHaveCount(0);

      const detail = await apiGetBook(request, token, book.slug);
      const sections = (detail.sections ?? []) as { title: string }[];
      expect(sections).toHaveLength(1);
      expect(sections[0]!.title).toBe('Bölüm A — yeniden adlandırıldı');
    } finally {
      await apiDeleteBook(request, token, book.id);
    }
  });

  test('page content edit persists after leaving write step', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Yayın Sayfa');
    const book = await apiCreatePublishedBookWithTwoSections(request, token, title);

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await clearBookEditorStorage(page);
      await page.goto(`/dashboard/books/update/${book.slug}?step=4`);
      await expect(page.locator('.ProseMirror').first()).toBeVisible({ timeout: 30_000 });

      const editor = page.locator('.ProseMirror').first();
      await editor.click();
      await page.keyboard.press('Control+A');
      const newContent = 'Yayın sonrası güncellenmiş sayfa içeriği.';
      await page.keyboard.type(newContent);

      const savePromise = waitForDraftSave(page);
      await page.getByRole('button', { name: 'Kaydet' }).click();
      await savePromise;

      await page.getByRole('button', { name: 'Sayfalar' }).click();
      await expect(
        page.getByText(/Her bölüm için sayfaları oluşturun/)
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole('button', { name: 'İleri' }).click();
      await expect(page.locator('.ProseMirror').first()).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('.ProseMirror').first()).toContainText(newContent);

      const detail = await apiGetBook(request, token, book.slug);
      const sections = (detail.sections ?? []) as { pages: { content: string }[] }[];
      const allContent = sections.flatMap((s) => s.pages.map((p) => p.content)).join(' ');
      expect(allContent).toContain(newContent);
    } finally {
      await apiDeleteBook(request, token, book.id);
    }
  });

  test('page delete persists after navigation', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const title = uniqueE2eTitle('E2E Yayın Sayfa Sil');
    const book = await apiCreatePublishedBookWithTwoSections(request, token, title);

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await clearBookEditorStorage(page);
      await page.goto(`/dashboard/books/update/${book.slug}?step=3`);
      await expect(page.getByText(/Her bölüm için sayfaları oluşturun/)).toBeVisible({
        timeout: 30_000,
      });

      await page.getByRole('button', { name: 'Yeni Sayfa' }).click();
      await page.getByRole('button', { name: 'Sayfalar' }).click();
      await expect(page.getByText(/Sayfalar \(2\)/)).toBeVisible({ timeout: 15_000 });

      const pageCard = page.locator('.group').filter({ hasText: 'Sayfa 2' }).first();
      await pageCard.hover();
      const deleteSave = waitForDraftSave(page);
      await pageCard.locator('button').last().click();
      await deleteSave;

      await expect(page.getByText(/Sayfalar \(1\)/)).toBeVisible({ timeout: 10_000 });

      const forwardSave = waitForDraftSave(page);
      await page.getByRole('button', { name: 'İleri' }).click();
      await forwardSave;
      await page.getByRole('button', { name: 'Geri' }).click();

      await expect(page.getByText(/Sayfalar \(1\)/)).toBeVisible();
      await expect(page.getByText('Sayfa 2')).toHaveCount(0);

      const detail = await apiGetBook(request, token, book.slug);
      const sections = (detail.sections ?? []) as { pages: unknown[] }[];
      const pageCount = sections.reduce((n, s) => n + s.pages.length, 0);
      expect(pageCount).toBe(2);
    } finally {
      await apiDeleteBook(request, token, book.id);
    }
  });
});
