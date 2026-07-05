import { test, expect } from '@playwright/test';
import {
  API_BASE,
  apiGetUserId,
  apiLogin,
  apiLogout,
  apiPostComment,
  authHeaders,
  backendReachable,
  getReadableBook,
  requireSeededBackend,
  requireSeededAuthor,
  SEEDED_AUTHOR,
  SEEDED_READER,
} from './helpers';

test.describe('Extended API features', () => {
  test.beforeEach(async ({ request }) => {
    await requireSeededBackend(request);
  });

  test('logout invalidates bearer token', async ({ request }) => {
    const token = await apiLogin(request, SEEDED_READER);
    await apiLogout(request, token);
    const me = await request.get(`${API_BASE}/api/user`, { headers: authHeaders(token) });
    expect(me.status()).toBe(401);
  });

  test('GET /api/users/username/{username} returns public profile', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users/username/erenpadem`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data?.username ?? body.data?.user?.username).toBe('erenpadem');
  });

  test('GET /api/autocomplete/mentions returns author suggestions', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();
    const bookId = detail.data.id;

    const res = await request.get(
      `${API_BASE}/api/autocomplete/mentions?q=Eren&book_id=${bookId}`
    );
    expect(res.ok()).toBeTruthy();
    const authors = (await res.json()).data?.authors ?? [];
    expect(authors.length).toBeGreaterThan(0);
  });

  test('reader can rate a published book', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const token = await apiLogin(request, SEEDED_READER);
    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();

    const res = await request.post(`${API_BASE}/api/ratings`, {
      headers: authHeaders(token),
      data: { book_id: detail.data.id, score: 4 },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('author cannot rate own book via API', async ({ request }) => {
    await requireSeededAuthor(request);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const authorId = await apiGetUserId(request, authorToken);
    const booksRes = await request.get(`${API_BASE}/api/books?per_page=50`);
    const books = ((await booksRes.json()).data ?? []) as Array<{
      id: number;
      author_id: number;
    }>;
    const ownBook = books.find((b) => b.author_id === authorId);
    test.skip(!ownBook, 'No published book owned by seeded author');

    const res = await request.post(`${API_BASE}/api/ratings`, {
      headers: authHeaders(authorToken),
      data: { book_id: ownBook!.id, score: 5 },
    });
    expect(res.status()).toBe(403);
  });

  test('author cannot like own book via API', async ({ request }) => {
    await requireSeededAuthor(request);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const authorId = await apiGetUserId(request, authorToken);
    const booksRes = await request.get(`${API_BASE}/api/books?per_page=50`);
    const books = ((await booksRes.json()).data ?? []) as Array<{
      id: number;
      author_id: number;
    }>;
    const ownBook = books.find((b) => b.author_id === authorId);
    test.skip(!ownBook, 'No published book owned by seeded author');

    const res = await request.post(`${API_BASE}/api/likes/toggle`, {
      headers: authHeaders(authorToken),
      data: { book_id: ownBook!.id },
    });
    expect(res.status()).toBe(403);
  });

  test('reader can like a comment via API', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();
    const bookId = detail.data.id;

    const list = await request.get(`${API_BASE}/api/comments/book/${bookId}`);
    const comments = (await list.json()).data ?? [];
    test.skip(comments.length === 0, 'No comments on book');

    const token = await apiLogin(request, SEEDED_READER);
    const commentId = comments[0].id;
    const like = await request.post(`${API_BASE}/api/comments/${commentId}/like`, {
      headers: authHeaders(token),
    });
    expect(like.ok()).toBeTruthy();
  });

  test('reader can follow and unfollow an author', async ({ request }) => {
    const readerToken = await apiLogin(request, SEEDED_READER);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const authorId = await apiGetUserId(request, authorToken);

    // Idempotent: clear any prior follow from a previous run.
    await request.delete(`${API_BASE}/api/follows/${authorId}`, {
      headers: authHeaders(readerToken),
    });

    const follow = await request.post(`${API_BASE}/api/follows`, {
      headers: authHeaders(readerToken),
      data: { following_id: authorId },
    });
    expect(follow.status()).toBe(201);

    const followers = await request.get(`${API_BASE}/api/follows/${authorId}/followers`, {
      headers: authHeaders(readerToken),
    });
    expect(followers.ok()).toBeTruthy();

    const unfollow = await request.delete(`${API_BASE}/api/follows/${authorId}`, {
      headers: authHeaders(readerToken),
    });
    expect(unfollow.ok()).toBeTruthy();
  });

  test('reader can create and list page notes', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const token = await apiLogin(request, SEEDED_READER);
    const create = await request.post(`${API_BASE}/api/page-notes`, {
      headers: authHeaders(token),
      data: {
        page_id: book!.pageId,
        selected_text: 'E2E highlight',
        note: 'E2E note',
        start_offset: 0,
        end_offset: 5,
        color: 'yellow',
      },
    });
    expect(create.ok()).toBeTruthy();

    const list = await request.get(`${API_BASE}/api/page-notes/page/${book!.pageId}`, {
      headers: authHeaders(token),
    });
    expect(list.ok()).toBeTruthy();
    const notes = (await list.json()).data ?? [];
    expect(notes.length).toBeGreaterThan(0);

    const noteId = notes[0].id;
    await request.delete(`${API_BASE}/api/page-notes/${noteId}`, {
      headers: authHeaders(token),
    });
  });

  test('comment reply creates notification for parent author', async ({ request }) => {
    const book = await getReadableBook(request);
    test.skip(!book, 'No readable book seeded');

    const readerToken = await apiLogin(request, SEEDED_READER);
    const authorToken = await apiLogin(request, SEEDED_AUTHOR);
    const detail = await (
      await request.get(`${API_BASE}/api/books/${book!.slug}`)
    ).json();
    const bookId = detail.data.id;

    const parent = await apiPostComment(request, readerToken, {
      bookId,
      content: `E2E parent comment ${Date.now()}`,
    });

    await apiPostComment(request, authorToken, {
      bookId,
      content: 'E2E reply from author',
      parentId: parent.id,
    });

    const notifRes = await request.get(`${API_BASE}/api/notifications`, {
      headers: authHeaders(readerToken),
    });
    expect(notifRes.ok()).toBeTruthy();
    const items = (await notifRes.json()).data ?? [];
    expect(items.some((n: { type: string }) => n.type === 'comment_reply')).toBeTruthy();

    const unread = await request.get(`${API_BASE}/api/notifications/unread-count`, {
      headers: authHeaders(readerToken),
    });
    expect(unread.ok()).toBeTruthy();
  });

  test('notifications can be marked all read', async ({ request }) => {
    const readerToken = await apiLogin(request, SEEDED_READER);
    const mark = await request.post(`${API_BASE}/api/notifications/mark-all-read`, {
      headers: authHeaders(readerToken),
    });
    expect(mark.ok()).toBeTruthy();
  });
});
