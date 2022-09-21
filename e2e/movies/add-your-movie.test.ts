import { test, expect } from '@playwright/test';
import { performSignIn } from '../e2e-test-helpers';

const pagePath = '/movies/add';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await performSignIn(page);
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Add your movie and reach horror fans looking for movies on Slasher!/);
  });
});
