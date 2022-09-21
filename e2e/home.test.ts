import { test, expect } from '@playwright/test';
import { performSignIn } from './e2e-test-helpers';

const pagePath = '/home';

test.beforeEach(async ({ page }) => {
  await performSignIn(page);
  await page.goto(pagePath);
});

test.describe(pagePath, () => {
  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Suggested friends/);
  });
});
