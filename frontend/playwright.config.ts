import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
// Allow running against an already-installed browser channel (e.g. system Chrome)
// instead of the downloaded Chromium build. Useful when the Playwright browser
// download is unavailable. Leave unset in CI to use the bundled Chromium.
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video recording needs the Playwright ffmpeg binary. Allow disabling it
    // (PLAYWRIGHT_NO_VIDEO=1) when only the system browser channel is available.
    video: process.env.PLAYWRIGHT_NO_VIDEO ? 'off' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/book-wizard.spec.ts',
      use: { ...devices['Desktop Chrome'], channel },
    },
    {
      name: 'book-wizard',
      testMatch: '**/book-wizard.spec.ts',
      dependencies: ['chromium'],
      use: { ...devices['Desktop Chrome'], channel },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
