import { test, expect } from '@playwright/test';

const pagePath = '/';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
  });

  test('should redirect to /home', async ({ page, baseURL }) => {
    const expectedUrl = `${baseURL}/home`;
    await page.waitForNavigation({ url: expectedUrl, timeout: 5000 });
    await expect(page.url()).toBe(expectedUrl);
  });
});
