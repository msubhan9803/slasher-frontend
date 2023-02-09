import { test, expect } from '@playwright/test';

const pagePath = '/app/verification-email-not-received';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/please enter your email address below/);
  });
});
