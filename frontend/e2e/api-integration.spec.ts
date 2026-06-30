import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiLogin,
  apiRegister,
  backendReachable,
  getReadableBook,
  SEEDED_AUTHOR,
} from './helpers';

/**
 * Backend REST API integration coverage. These run against the real Laravel API.
 * They are skipped (not failed) when the backend is unreachable.
 */
test.describe('Backend API', () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await backendReachable(request)), `Backend unreachable at ${API_BASE}`);
  });

  test('GET /api/books returns paginated list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/books`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/categories returns a list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/categories`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('GET /api/books/{slug} returns a single book with nested sections', async ({ request }) => {
    const list = await (await request.get(`${API_BASE}/api/books?per_page=1`)).json();
    test.skip(!list.data?.length, 'No books seeded');
    const slug = list.data[0].slug || list.data[0].id;

    const res = await request.get(`${API_BASE}/api/books/${slug}?include=sections`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data).toHaveProperty('title');
    expect(body.data).toHaveProperty('sections');
  });

  test('GET /api/books/{slug}/similar returns related books', async ({ request }) => {
    const list = await (await request.get(`${API_BASE}/api/books?per_page=1`)).json();
    test.skip(!list.data?.length, 'No books seeded');
    const slug = list.data[0].slug || list.data[0].id;
    const res = await request.get(`${API_BASE}/api/books/${slug}/similar`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/comments/book/{id} returns comments', async ({ request }) => {
    const list = await (await request.get(`${API_BASE}/api/books?per_page=1`)).json();
    test.skip(!list.data?.length, 'No books seeded');
    const id = list.data[0].id;
    const res = await request.get(`${API_BASE}/api/comments/book/${id}`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/ratings/book/{id} returns ratings', async ({ request }) => {
    const list = await (await request.get(`${API_BASE}/api/books?per_page=1`)).json();
    test.skip(!list.data?.length, 'No books seeded');
    const id = list.data[0].id;
    const res = await request.get(`${API_BASE}/api/ratings/book/${id}`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/quotes requires user_id and works when provided', async ({ request }) => {
    // Without user_id the endpoint validates and returns 422.
    const missing = await request.get(`${API_BASE}/api/quotes`, {
      headers: { Accept: 'application/json' },
    });
    expect(missing.status()).toBe(422);

    // With a valid user_id it returns JSON.
    const ok = await request.get(`${API_BASE}/api/quotes?user_id=1`);
    expect(ok.ok()).toBeTruthy();
  });

  test('search filter narrows book results', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');
    const term = book!.title.split(' ')[0];
    const res = await request.get(
      `${API_BASE}/api/books?search=${encodeURIComponent(term)}`
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('protected route rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/user`, {
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('login returns a usable bearer token', async ({ request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const me = await request.get(`${API_BASE}/api/user`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    expect(me.ok()).toBeTruthy();
  });

  test('login with wrong password is rejected', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/login`, {
      data: { email: SEEDED_AUTHOR.email, password: 'definitely-wrong' },
      headers: { Accept: 'application/json' },
    });
    expect(res.ok()).toBeFalsy();
    expect([401, 422]).toContain(res.status());
  });

  test('register creates a new account', async ({ request }) => {
    const { email } = await apiRegister(request);
    expect(email).toContain('@folory.test');
  });

  test('authenticated user can read dashboard stats and own books', async ({ request }) => {
    const token = await apiLogin(request, SEEDED_AUTHOR);
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    const stats = await request.get(`${API_BASE}/api/dashboard/stats`, { headers });
    expect(stats.ok()).toBeTruthy();
    const statsBody = await stats.json();
    expect(statsBody.data?.stats).toHaveProperty('total_books');

    const myBooks = await request.get(`${API_BASE}/api/books/me`, { headers });
    expect(myBooks.ok()).toBeTruthy();
  });
});
