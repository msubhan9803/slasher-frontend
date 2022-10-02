/* eslint-disable import/prefer-default-export */
import { Page, test, expect } from '@playwright/test';

export async function testSignInRequirement(pagePath: string, page: Page, baseURL: string) {
  await test.step('when user is not signed in, should redirect to the sign-in page', async () => {
    await page.goto(pagePath);
    const signInUrl = `${baseURL}/sign-in`;
    await page.waitForURL(signInUrl);
    await expect(page.url()).toBe(signInUrl);
  });
}
