import { test, expect } from '@playwright/test';

const pagePath = '/dating/tutorial/dating-messages';

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Let’s get you ready!/);
    });
  });
});
