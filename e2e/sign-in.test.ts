import { test, expect } from '@playwright/test';

const pagePath = '/app/sign-in';

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  // We perform a sign-in in our globalSetup function,
  // so this test starts out with an already-signed-in user
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });
    test('should redirect to the /app/home page', async ({ page, baseURL }) => {
      const homeUrl = `${baseURL}/app/home`;
      await page.waitForURL(homeUrl);
      await expect(page.url()).toBe(homeUrl);
    });
  });
});
