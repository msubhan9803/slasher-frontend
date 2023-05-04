import { test, expect } from '@playwright/test';

const pagePath = '/app/registration/terms';

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Please scroll down to review our Terms and Conditions/);
  });
});
