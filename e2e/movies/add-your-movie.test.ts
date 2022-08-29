import { test, expect } from '@playwright/test';

const pagePath = '/movies/add';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Add your movie and reach horror fans looking for movies on Slasher!/);
  });
});
