import { test, expect } from '@playwright/test';
import { performSignIn } from '../../e2e-test-helpers';

const pagePath = '/news/partner/1/posts/1';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await performSignIn(page);
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/This space is used to help indie creators have a platform to promote their work./);
  });
});
