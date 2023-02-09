import { test, expect } from '@playwright/test';

const pagePath = '/app/registration/identity';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/This is how your first name will appear in your profile./);
  });
});
