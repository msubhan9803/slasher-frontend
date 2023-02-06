// global-setup.ts
import { chromium, FullConfig, Page } from '@playwright/test';
import setupMockResponses from './mock-responses/setupMockResponses';

async function performSignIn(page: Page, baseURL: string) {
  setupMockResponses(page);

  await page.goto(`${baseURL}/sign-in`);
  await page.waitForSelector('input[name="emailOrUsername"]');
  await page.locator('input[name="emailOrUsername"]').fill('sample1@example.com');
  await page.locator('input[name="password"]').fill('test@123');
  await page.locator('#sign-in-button >> text=Sign in').click();
}

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await performSignIn(page, baseURL!);

  // Wait a moment for sign-in to finish, otherwise storageState
  // will be empty when it is written to the storageState file.
  await page.waitForTimeout(2000);

  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
