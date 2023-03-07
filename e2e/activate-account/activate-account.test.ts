import { test, expect } from '@playwright/test';

const pagePath = '/app/activate-account';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Activate Your Account/);
  });
});
