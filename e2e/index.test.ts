import { test, expect } from '@playwright/test';

const pagePath = '/';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test.describe('unauthenticated user', () => {
    test.use({ storageState: 'e2e/.storage-states/unauthenticatedUser.json' });

    test(
      'should render the public home page for a non-logged-in user',
      async ({ page, baseURL }) => {
        await expect(page.url()).toBe(`${baseURL}/`);
        await expect(page.locator('body')).toHaveText(
          /SLASHER IS THE ULTIMATE APP FOR HORROR FANS/,
        );
      },
    );
  });

  test.describe('authenticated user', () => {
    test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

    test('should redirect to /app/home for a logged in user', async ({ page, baseURL }) => {
      const expectedUrl = `${baseURL}/app/home`;
      if (page.url() !== expectedUrl) {
        await page.waitForNavigation({ url: expectedUrl, timeout: 5000 });
      }
      await expect(page.url()).toBe(expectedUrl);
    });
  });
});
