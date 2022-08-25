import { test, expect } from '@playwright/test';

const pagePath = '/messages/conversation/1';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Hi, Aly/);
  });
});
