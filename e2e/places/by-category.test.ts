import { test, expect } from '@playwright/test';

import { performSignIn } from '../e2e-test-helpers';
import { testSignInRequirement } from '../shared-examples/sign-in';

const pagePath = '/places/by-category';

test.describe(pagePath, () => {
  test('shared tests', async ({ page, baseURL }) => {
    await testSignInRequirement(pagePath, page, baseURL!);
  });

  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await performSignIn(page);
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/By category/);
    });
  });
});
