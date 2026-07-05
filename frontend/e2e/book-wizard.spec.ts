import { test, expect } from '@playwright/test';
import {
  API_BASE,
  requireSeededAuthor,
  clearBookEditorStorage,
  expectNoAppCrash,
  loginAs,
  SEEDED_AUTHOR,
  uniqueE2eTitle,
  waitForDraftSave,
} from './helpers';

/** Unique title so parallel runs and re-runs do not collide. */
function uniqueBookTitle(): string {
  return uniqueE2eTitle('E2E Sihirbaz');
}

test.describe('Book creation wizard (author)', () => {
  test.setTimeout(120_000);
  // Wizard tests mutate shared author state — run sequentially to avoid flakes.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    await requireSeededAuthor(request);
  });

  /** Navigate from write step (4) to publish step (5). */
  async function advanceFromWriteStep(page: import('@playwright/test').Page) {
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 20_000 });
    // Flush TipTap content into the zustand store via explicit save.
    await page.getByRole('button', { name: 'Kaydet' }).click();
    const advanceBtn = page.getByRole('button', { name: 'İlerle' });
    await expect(advanceBtn).toBeEnabled({ timeout: 15_000 });
    await advanceBtn.click();
    await expect(page.getByText('Kitabınızı Yayınlayın')).toBeVisible({ timeout: 20_000 });
  }

  /** Step 1: fill required fields and wait until the wizard allows advancing. */
  async function completeBookInfoStep(
    page: import('@playwright/test').Page,
    title: string,
    description: string
  ) {
    await page.getByLabel('Kitap Başlığı *').fill(title);
    await page.getByLabel('Kısa Açıklama').fill(description);

    await page.locator('#category').click();
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 20_000 });
    const categoryName = (await firstOption.textContent())?.trim();
    await firstOption.click();

    if (categoryName) {
      await expect(page.locator('#category')).not.toContainText('Kategori seçin', {
        timeout: 10_000,
      });
      await expect(page.locator('#category')).toContainText(categoryName, {
        timeout: 10_000,
      });
    }

    const nextBtn = page.getByRole('button', { name: 'İleri' });
    await expect(nextBtn).toBeEnabled({ timeout: 20_000 });
    await nextBtn.click();
    await expect(page.getByText('Bölümlerinizi oluşturun')).toBeVisible({ timeout: 15_000 });
  }

  test('create → section → page → write → publish → book is live', async ({
    page,
    request,
  }) => {
    const title = uniqueBookTitle();
    const description = 'Playwright uçtan uca sihirbaz testi ile oluşturuldu.';
    const pageContent = 'Bu sayfa otomatik test tarafından yazıldı. Fo-lory MVP.';

    await loginAs(page, request, SEEDED_AUTHOR);

    await clearBookEditorStorage(page);

    await page.goto('/dashboard/books/new');

    // Wait for persist hydration + reset cycle to finish.
    await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });
    await page.waitForResponse(
      (r) => r.url().includes('/api/categories') && r.ok(),
      { timeout: 30_000 }
    ).catch(() => {
      /* categories may already be cached */
    });

    // ── Step 1: Book info ──────────────────────────────────────────────
    await completeBookInfoStep(page, title, description);

    // ── Step 2: Sections ───────────────────────────────────────────────
    const sectionInput = page.getByPlaceholder('Bölüm başlığı');
    await sectionInput.fill('Bölüm 1 - Başlangıç');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByText('Bölümler (1)')).toBeVisible();

    await page.getByRole('button', { name: 'İleri' }).click();
    await expect(
      page.getByText(/Her bölüm için sayfaları oluşturun/)
    ).toBeVisible({ timeout: 15_000 });

    // ── Step 3: Pages ──────────────────────────────────────────────────
    // Creating a page auto-navigates to the write step (step 4).
    await page.getByRole('button', { name: 'Yeni Sayfa' }).click();

    // ── Step 4: Write content ──────────────────────────────────────────
    await expect(page.getByText('Sayfa 1 /')).toBeVisible({ timeout: 20_000 });
    const editor = page.locator('.ProseMirror').first();
    await editor.click();
    await page.keyboard.type(pageContent);
    await advanceFromWriteStep(page);

    const publishResponse = page.waitForResponse(
      (r) =>
        (r.url().includes('/api/books') &&
          (r.request().method() === 'POST' || r.request().method() === 'PUT')) ||
        r.url().includes('/publish'),
      { timeout: 60_000 }
    );

    await page.getByRole('button', { name: 'Yayınla' }).click();
    await publishResponse;

    await expect(page.getByText(/Başarılı!/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/yayınlandı/i)).toBeVisible();

    // Redirects to the author's book list after ~2 s.
    await page.waitForURL(/\/dashboard\/books/, { timeout: 15_000 });
    await expectNoAppCrash(page);

    // ── Verify via public API ────────────────────────────────────────────
    const token = await (async () => {
      const res = await request.post(`${API_BASE}/api/login`, {
        data: SEEDED_AUTHOR,
        headers: { Accept: 'application/json' },
      });
      const body = await res.json();
      return body.data.token as string;
    })();

    const searchRes = await request.get(
      `${API_BASE}/api/books?search=${encodeURIComponent(title)}&is_published=true`,
      { headers: { Accept: 'application/json' } }
    );
    expect(searchRes.ok()).toBeTruthy();
    const searchBody = await searchRes.json();
    const found = (searchBody.data ?? []).find(
      (b: { title: string }) => b.title === title
    );
    expect(found, `Published book "${title}" not found in API`).toBeTruthy();
    expect(found.is_published).toBeTruthy();

    // Book detail page loads for readers.
    const slug = found.slug || found.id;
    await page.goto(`/book/${slug}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole('button', { name: /Okumaya Başla|Okumaya Devam Et/ }).first()
    ).toBeVisible();
  });

  test('save as draft without publishing', async ({ page, request }) => {
    const title = uniqueBookTitle();

    await loginAs(page, request, SEEDED_AUTHOR);
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('book-editor-storage');
      } catch {
        /* ignore */
      }
    });

    await page.goto('/dashboard/books/new');
    await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });
    await page.waitForResponse(
      (r) => r.url().includes('/api/categories') && r.ok(),
      { timeout: 30_000 }
    ).catch(() => {
      /* categories may already be cached */
    });

    await completeBookInfoStep(page, title, 'Taslak açıklama.');

    await page.getByPlaceholder('Bölüm başlığı').fill('Taslak Bölüm');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await page.getByRole('button', { name: 'İleri' }).click();

    await page.getByRole('button', { name: 'Yeni Sayfa' }).click();
    await page.locator('.ProseMirror').first().click();
    await page.keyboard.type('Taslak içerik.');
    await advanceFromWriteStep(page);

    await page.getByRole('button', { name: 'Taslak Olarak Kaydet' }).click();
    await expect(page.getByText(/Başarılı!/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/taslak olarak kaydedildi/i)).toBeVisible();
    await page.waitForURL(/\/dashboard\/books/, { timeout: 15_000 });

    const token = (
      await (
        await request.post(`${API_BASE}/api/login`, {
          data: SEEDED_AUTHOR,
          headers: { Accept: 'application/json' },
        })
      ).json()
    ).data.token;

    const myBooks = await request.get(`${API_BASE}/api/books/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    expect(myBooks.ok()).toBeTruthy();
    const body = await myBooks.json();
    const draft = (body.data ?? []).find((b: { title: string }) => b.title === title);
    expect(draft, `Draft "${title}" not in /api/books/me`).toBeTruthy();
    expect(draft.is_draft).toBeTruthy();
  });

  test('deleting a section persists after autosave (no zombie sections)', async ({
    page,
    request,
  }) => {
    const title = uniqueBookTitle();

    await loginAs(page, request, SEEDED_AUTHOR);
    await clearBookEditorStorage(page);
    await page.goto('/dashboard/books/new');
    await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });

    await completeBookInfoStep(page, title, 'Bölüm silme testi.');

    const sectionInput = page.getByPlaceholder('Bölüm başlığı');
    await sectionInput.fill('Kalacak Bölüm');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await sectionInput.fill('Silinecek Bölüm');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByText('Bölümler (2)')).toBeVisible();

    // Delete second section (trash is visible on row hover).
    const doomedRow = page.locator('.group.relative').filter({ hasText: 'Silinecek Bölüm' });
    await doomedRow.hover();
    await doomedRow.locator('button.text-destructive').click();

    await expect(page.getByText('Bölümler (1)')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Silinecek Bölüm')).toHaveCount(0);

    const savePromise = waitForDraftSave(page);
    await page.getByRole('button', { name: 'İleri' }).click();
    await savePromise;

    // Go back to sections — deleted section must not reappear from server sync.
    await page.getByRole('button', { name: 'Geri' }).click();
    await expect(page.getByText('Bölümlerinizi oluşturun')).toBeVisible();
    await expect(page.getByText('Bölümler (1)')).toBeVisible();
    await expect(page.getByText('Silinecek Bölüm')).toHaveCount(0);
    await expect(page.getByText('Kalacak Bölüm')).toBeVisible();
  });

  test('advancing steps does not duplicate a single section', async ({ page, request }) => {
    const title = uniqueBookTitle();

    await loginAs(page, request, SEEDED_AUTHOR);
    await clearBookEditorStorage(page);
    await page.goto('/dashboard/books/new');
    await expect(page.getByLabel('Kitap Başlığı *')).toBeVisible({ timeout: 30_000 });

    await completeBookInfoStep(page, title, 'Çift bölüm önleme.');

    await page.getByPlaceholder('Bölüm başlığı').fill('Tek Bölüm');
    await page.getByRole('button', { name: 'Ekle' }).click();
    await expect(page.getByText('Bölümler (1)')).toBeVisible();

    const savePromise = waitForDraftSave(page);
    await page.getByRole('button', { name: 'İleri' }).click();
    await savePromise;

    await expect(
      page.getByText(/Her bölüm için sayfaları oluşturun/)
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Geri' }).click();
    await expect(page.getByText('Bölümler (1)')).toBeVisible();
    await expect(page.getByText('Tek Bölüm')).toHaveCount(1);
  });
});
