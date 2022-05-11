import { test, expect } from '@playwright/test';

test.describe('Home page (i.e. "/home")', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('.home')).toHaveText(/This is a placeholder home page!/);
  });
});
