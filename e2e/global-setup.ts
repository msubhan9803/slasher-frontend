// global-setup.ts
import { chromium, FullConfig, Page } from '@playwright/test';
import { apiUrl } from '../src/api/constants';

async function performSignIn(page: Page, baseURL: string) {
  // Mock auth response
  page.route(`${apiUrl}/users/sign-in`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        userName: 'SampleUser1',
        email: 'sample1@example.com',
        firstName: 'Sample1',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzI5NGRmZmI2ODEyNmY5YzcyMThlM2MiLCJ1c2VyVHlwZSI6IjEiLCJwYXNzd29yZENoYW5nZWRBdCI6IjIwMjItMDktMjBUMDU6MjI6MDcuNzYxWiIsImlhdCI6MTY2MzczMTg5Nn0._eVEZJZ2ldXOPsjfWJwOb7JPI0jbsjzwzphC7eCmdYU',
      }),
    });
  });

  await Promise.all([
    page.goto(`${baseURL}/sign-in`),
    page.waitForNavigation(),
  ]);
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
