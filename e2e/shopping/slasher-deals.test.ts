import { test, expect } from '@playwright/test';

const pagePath = '/shopping/slasher-deals';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Slasher deals/);
  });
});
