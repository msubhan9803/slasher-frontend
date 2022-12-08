import { test, expect } from '@playwright/test';
import { performSignIn } from '../../../e2e/e2e-test-helpers';
import { testSignInRequirement } from '../../shared-tests/sign-in';

const pagePath = '/news/partner/1/posts/1';

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
      // TODO: Update this test to look for real content in the future
      await expect(page.locator('main')).toHaveText(/Advertisment/);
    });
  });
});
