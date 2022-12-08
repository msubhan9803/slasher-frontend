import { test, expect } from '@playwright/test';

const pagePath = '/news/partner/1/posts/1';

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      // TODO: Update this test to look for real content in the future
      await expect(page.locator('main')).toHaveText(/Advertisment/);
    });
  });
});
