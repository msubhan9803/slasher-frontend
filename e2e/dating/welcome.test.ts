import { test, expect } from '@playwright/test';

const pagePath = '/dating/welcome';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/We want you to have a good experience!/);
  });
});
