import { test, expect } from '@playwright/test';

const pagePath = '/registration/security';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Your age will not be shown in your profile and you cannot change your date of birth later./);
  });
});
