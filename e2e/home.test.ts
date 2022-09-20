import { test, expect } from '@playwright/test';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const pagePath = '/home';
test.beforeEach(async () => {
  const mock = new MockAdapter(axios);
  // Mock any GET request to /users
  // arguments for reply are (status, data, headers)
  mock.onPost('users/sign-in').reply((config: any) => {
    const data = JSON.parse(config.data);
    if (data.email === 'authorA@test.com') {
      return [200, 'response'];
    }
    return [200];
  });

  // axios.get('/users').then(async () => {
  //   Cookies.set('sessionToken', 'mockToken');
  //   // await page.goto(pagePath);
  // });
  // await page.route('**/api/fetch_data', (route) => route.fulfill({
  //   status: 200,
  //   body: 'mockToken',
  // }));
  // const [response] = await Promise.all([
  //   page.waitForResponse((res) => {
  //     Cookies.set('sessionToken', 'mockToken');
  //     return res.status() === 200;
  //   }),
  // ]);
  // console.log('response', response.json());
  // await page.goto(pagePath);
});

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('input[name="emailOrUsername"]').fill('test@gmail.com');
    await page.locator('input[name="password"]').fill('test@123');
    await page.locator('#sign-in-button >> text=Sign in').click();
    await page.goto(pagePath);
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Suggested friends/);
  });
});
