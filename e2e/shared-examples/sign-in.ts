/* eslint-disable import/prefer-default-export */
import { Page, test, expect } from '@playwright/test';

export async function testSignInRequirement(pagePath: string, page: Page, baseURL: string) {
  await test.step('when user is not signed in, should redirect to the sign-in page', async () => {
    await page.goto(pagePath);
    await page.waitForURL(`${baseURL}/sign-in`);
    await expect(page.url()).toBe(`${baseURL}/sign-in`);
  });
}
