import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiLogin,
  authHeaders,
  backendReachable,
  expectNoAppCrash,
  loginAs,
  requireSeededAuthor,
  requireSeededBackend,
  SEEDED_AUTHOR,
  SEEDED_READER,
} from './helpers';

test.describe('Profile & settings (authenticated)', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('reader sees become-author card in settings', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_READER);
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'Profil' }).click();
    await expect(page.getByText('Yazar hesabına geç')).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: /Doğrulama e-postası gönder|Yazar ol|Kodu gir/ }).first()
    ).toBeVisible();
  });

  test('account deactivation dialog opens from profile settings tab', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_READER);
    await page.goto('/profile?tab=settings');
    await page.getByRole('button', { name: 'Hesabı devre dışı bırak' }).click();
    await expect(page.getByRole('dialog').getByText('Hesabı devre dışı bırak')).toBeVisible();
    await page.getByRole('button', { name: 'Vazgeç' }).click();
    await page.getByRole('button', { name: 'Hesabı sil' }).click();
    await expect(page.getByText('Hesabı kalıcı olarak sil')).toBeVisible();
    await page.getByRole('button', { name: 'Vazgeç' }).click();
  });
});

test.describe('Profile & settings (author)', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededAuthor(request);
  });

  test('author can update profile name and bio in settings', async ({ page, request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const meBefore = await request.get(`${API_BASE}/api/user`, { headers: authHeaders(token) });
    const user = (await meBefore.json()).data?.user ?? (await meBefore.json()).data;
    const originalName = user.name as string;
    const originalBio = (user.bio as string) ?? '';

    const newName = `${originalName} E2E`;
    const newBio = `E2E bio ${Date.now()}`;

    try {
      await loginAs(page, request, SEEDED_AUTHOR);
      await page.goto('/settings');
      await page.getByRole('tab', { name: 'Profil' }).click();

      await page.locator('#name').fill(newName);
      await page.locator('#bio').fill(newBio);

      const save = page.waitForResponse(
        (r) => r.url().includes('/api/user/profile') && r.request().method() === 'PUT',
        { timeout: 15_000 }
      );
      await page.getByRole('button', { name: 'Kaydet' }).click();
      expect((await save).ok()).toBeTruthy();

      await page.reload();
      await expect(page.locator('#name')).toHaveValue(newName);
      await expect(page.locator('#bio')).toHaveValue(newBio);
      await expectNoAppCrash(page);
    } finally {
      await request.put(`${API_BASE}/api/user/profile`, {
        headers: authHeaders(token),
        data: { name: originalName, bio: originalBio },
      });
    }
  });

  test('author can upload avatar from profile header', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/profile');

    const avatarBtn = page.getByRole('button', { name: 'Profil fotoğrafını değiştir' });
    await expect(avatarBtn).toBeVisible({ timeout: 15_000 });

    const fileInput = page.locator('input[type="file"][accept*="image"]').nth(1);
    const upload = page.waitForResponse(
      (r) => r.url().includes('/api/user/profile') && r.request().method() === 'PUT',
      { timeout: 30_000 }
    );
    await fileInput.setInputFiles('public/assets/logo-64.png');
    expect((await upload).ok()).toBeTruthy();
    await expectNoAppCrash(page);
  });

  test('author profile shows cover change control on own profile', async ({ page, request }) => {
    await loginAs(page, request, SEEDED_AUTHOR);
    await page.goto('/profile');
    await expect(page.getByRole('button', { name: 'Kapak Resmini Değiştir' })).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe('Public profile', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('public author profile renders without crash', async ({ page }) => {
    await page.goto('/profile/erenpadem');
    await expect(page.getByText(/Eren Padem|erenpadem/).first()).toBeVisible({
      timeout: 15_000,
    });
    await expectNoAppCrash(page);
  });
});
