import { test, expect } from "@playwright/test";

test.describe('Index page (i.e. "/")', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should redirect to /home", async ({ page, baseURL }) => {
    const expectedUrl = `${baseURL}/home`;
    await page.waitForNavigation({ url: expectedUrl, timeout: 5000 });
    await expect(page.url()).toBe(`${baseURL}/home`);
  });
});
