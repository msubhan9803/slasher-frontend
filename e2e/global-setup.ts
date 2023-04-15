// global-setup.ts
import {
  Browser, chromium, FullConfig, Page,
} from '@playwright/test';
import setupMockResponses from './mock-responses/setupMockResponses';

const authenticatedUserFile = 'e2e/.storage-states/authenticatedUser.json';
const unauthenticatedUserFile = 'e2e/.storage-states/unauthenticatedUser.json';

async function performSignIn(page: Page, baseURL: string, userName: string, password: string) {
  setupMockResponses(page);

  await page.goto(`${baseURL}/app/sign-in`);
  await page.waitForSelector('input[name="emailOrUsername"]');
  await page.locator('input[name="emailOrUsername"]').fill(userName);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('#sign-in-button >> text=Sign in').click();
}

const withNewBrowser = async (callback: (browser: Browser) => Promise<void>) => {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    await callback(browser);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

async function createAuthenticatedUserBrowserState(baseURL: string) {
  await withNewBrowser(async (browser) => {
    const page = await browser.newPage();

    // Increase navigation timeout to support slow systems.
    page.context().setDefaultNavigationTimeout(180_000); // Default = 10_000

    // Sign in as a basic user
    await performSignIn(page, baseURL, 'sample1@example.com', 'test@123');

    // Wait a moment for sign-in to finish, otherwise storageState
    // will be empty when it is written to the storageState file.
    await page.waitForTimeout(2000);

    // Save state
    await page.context().storageState({ path: authenticatedUserFile });
  });
}

async function createUnauthenticatedUserBrowserState() {
  await withNewBrowser(async (browser) => {
    const page = await browser.newPage();

    // Do not sign in, and just safe default state
    await page.context().storageState({ path: unauthenticatedUserFile });
  });
}

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  await createAuthenticatedUserBrowserState(baseURL!);
  await createUnauthenticatedUserBrowserState();
}

export default globalSetup;
