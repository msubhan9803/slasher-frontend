import { test, expect } from '@playwright/test';
import { performSignIn } from '../e2e-test-helpers';

const pagePath = '/events/1';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await performSignIn(page);
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/1 Main St, New York, NY USA/);
  });
});
