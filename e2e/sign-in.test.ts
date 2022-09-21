import { test, expect } from '@playwright/test';

const pagePath = '/sign-in';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  // test.describe('for a signed-in user', () => {
  //   test('should redirect to the /home page', async ({ page }) => {
  //     // TODO
  //   });
  // });

  test.describe('for a user who is not currently signed in', () => {
    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Sign in/);
      await expect(page.locator('main')).toHaveText(/Forgot your password\?/);
    });
  });
});
