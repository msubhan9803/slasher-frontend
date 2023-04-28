import {
  test,
  // expect
} from '@playwright/test';

const pagePath = '/app/movies/1/details';

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    // TODO: Uncomment this test and look for real content in the future
    // test('should display the expected content', async ({ page }) => {
    //   await expect(page.locator('main')).toHaveText(/Overview/);
    // });
  });
});
