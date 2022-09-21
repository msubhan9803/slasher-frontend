import { test, expect } from '@playwright/test';

import { performSignIn } from '../e2e-test-helpers';

const pagePath = '/places/add';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await performSignIn(page);
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Add your destination and reach horror fans on Slasher more easily!/);
  });
});
