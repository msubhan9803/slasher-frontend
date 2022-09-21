import { test, expect } from '@playwright/test';
import { performSignIn } from './e2e-test-helpers';

const pagePath = '/sign-in';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await performSignIn(page);
      await page.goto(pagePath);
    });
    test('should redirect to the /home page', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Suggested friends/);
    });
  });

  test.describe('for a user who is not currently signed in', () => {
    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Sign in/);
      await expect(page.locator('main')).toHaveText(/Forgot your password\?/);
    });
  });
});
