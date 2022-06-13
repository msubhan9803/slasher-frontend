import { test, expect } from '@playwright/test';

const pagePath = '/sign-in';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Sign in/);
    await expect(page.locator('main')).toHaveText(/Forgot your password\?/);
    await expect(page.locator('main')).toHaveText(/Don’t have an account\?/);
  });
});
