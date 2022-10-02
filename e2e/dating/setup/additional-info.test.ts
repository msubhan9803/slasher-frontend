import { test, expect } from '@playwright/test';
import { performSignIn } from '../../e2e-test-helpers';
import { testSignInRequirement } from '../../shared-tests/sign-in';

const pagePath = '/dating/setup/additional-info';

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
      await expect(page.locator('main')).toHaveText(/Basic Info/);
    });
  });
});
