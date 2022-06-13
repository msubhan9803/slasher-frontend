import { test, expect } from '@playwright/test';

const pagePath = '/dating/setup/add-photos';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/You must add at least one photo to your dating profile/);
  });
});
