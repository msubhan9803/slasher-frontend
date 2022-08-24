import { test, expect } from '@playwright/test';

const pagePath = '/books/buy-list';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Buy list/);
  });
});
