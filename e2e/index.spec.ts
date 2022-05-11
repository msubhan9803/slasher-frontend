import { test, expect } from '@playwright/test';

test.describe('Index page (i.e. "/")', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // test('should redirect to /home', async ({ page, baseURL }) => {
  //   await expect(page.url()).toBe(`${baseURL}/home`);
  // });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('.App')).toHaveText(/save to reload/);
  });
});
