import { test, expect } from '@playwright/test';

const apiBase = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8081';

test.describe('Backend API (integration)', () => {
  test('GET /api/books returns JSON', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/books`).catch(() => null);
    test.skip(!res, `Backend yok veya erişilemiyor: ${apiBase}`);

    expect(res!.ok()).toBeTruthy();
    const body = await res!.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  test('GET /api/categories returns JSON', async ({ request }) => {
    const res = await request.get(`${apiBase}/api/categories`).catch(() => null);
    test.skip(!res, `Backend yok veya erişilemiyor: ${apiBase}`);

    expect(res!.ok()).toBeTruthy();
  });
});
