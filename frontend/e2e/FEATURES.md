# Fo-lory E2E Feature Coverage Matrix

Status: **covered** | **partial** | **missing** | **n/a** (no UI yet)

| Area | Feature | Spec file | Status |
|------|---------|-----------|--------|
| Auth | Login / register / protected redirect | `auth.spec.ts`, `auth-flow.spec.ts` | covered |
| Auth | Logout | `auth.spec.ts` | covered |
| Auth | Forgot password / verify email UI | `auth-recovery.spec.ts` | covered |
| Auth | OAuth Google/Apple | — | n/a |
| Auth | Become author | `profile-settings.spec.ts` | partial |
| Auth | Deactivate / delete dialogs | `profile-settings.spec.ts` | partial |
| Explore | Search, sort, filters, drafts hidden | `explore.spec.ts` | covered |
| Book detail | Metadata, read CTA, 404 | `book-detail.spec.ts` | covered |
| Book detail | Tab switch (Kitap / Bölümler / Yorumlar) | `book-detail.spec.ts` | covered |
| Reader | Nav, progress, keyboard | `reader.spec.ts` | covered |
| Reader | Bookmark, library, like, comment, mention | `reader-journeys.spec.ts` | covered |
| Reader | Reading settings panel | `reader-settings.spec.ts` | covered |
| Reader | Page notes UI | — | n/a (API only) |
| Author | Wizard publish/draft/section delete | `book-wizard.spec.ts` | covered |
| Author | Dashboard books filter/delete/edit | `author-dashboard.spec.ts` | covered |
| Author | Dashboard tabs (Yorumlar/Puanlar) | `author-dashboard.spec.ts` | covered |
| Profile | Settings name/bio, avatar, cover | `profile-settings.spec.ts` | covered |
| Profile | Tabs: books, likes, saved, favorites | `profile-tabs.spec.ts` | covered |
| Profile | Public profile | `profile-settings.spec.ts` | covered |
| Notifications | List, mark all read | `notifications.spec.ts` | covered |
| API | Books, library, bookmarks, progress | `api-integration.spec.ts` | covered |
| API | Ratings, comment like, follows, page notes | `features-api.spec.ts` | covered |
| API | Notifications, logout, users, autocomplete | `features-api.spec.ts` | covered |
| Social | Follow UI | `social-ui.spec.ts` | covered |
| Social | Comment reply UI | `social-ui.spec.ts` | covered |
| Ratings | Reader rating UI | `social-ui.spec.ts` | covered |
| Settings | Notification prefs (hidden until API) | `social-ui.spec.ts` | n/a |

Run all API tests (no browser):

```bash
PLAYWRIGHT_API_URL=http://127.0.0.1:8081 PLAYWRIGHT_SKIP_WEBSERVER=1 \
  npx playwright test e2e/api-integration.spec.ts e2e/features-api.spec.ts --project=chromium
```
