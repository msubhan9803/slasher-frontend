import { test, expect } from '@playwright/test';

const pagePath = '/sign-in';

test.describe(pagePath, () => {
  // We perform a sign-in in our globalSetup function,
  // so this test starts out with an already-signed-in user
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });
    test('should redirect to the /home page', async ({ page, baseURL }) => {
      const homeUrl = `${baseURL}/home`;
      await page.waitForURL(homeUrl);
      await expect(page.url()).toBe(homeUrl);
    });
  });
});
