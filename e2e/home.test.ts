import { test, expect } from '@playwright/test';
import setupMockResponses from './mock-responses/setupMockResponses';

const pagePath = '/app/home';

// Improve test timeout to support slow systems.
test.setTimeout(180_000); // Default = 10_000

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      // Make browser ready for testing
      setupMockResponses(page);
      // Increase navigation timeout to support slow systems.
      page.context().setDefaultNavigationTimeout(180_000); // Default = 10_000

      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Suggested friends/);
    });
  });
});
