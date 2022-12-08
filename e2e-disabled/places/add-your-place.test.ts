import { test, expect } from '@playwright/test';

const pagePath = '/places/add';

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Add your destination and reach horror fans on Slasher more easily!/);
    });
  });
});
