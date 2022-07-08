import { test, expect } from '@playwright/test';

const pagePath = '/news/partner/1';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/It is a long established fact that a reader will be by the readable content of a page when looking at its layout./);
  });
});
