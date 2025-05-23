import { test, expect } from '@playwright/test';

const pagePath = '/app/news/partner/1/posts/1';

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      // TODO: Update this test to look for real content in the future
      await expect(page.locator('#desktop-sidebar')).toHaveText(/Advertisement/);
    });
  });
});
