import { test, expect } from '@playwright/test';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Cookies from 'js-cookie';

const pagePath = '/dating/likes?user=subscriber';

test.describe(pagePath, () => {
  test.beforeEach(async ({ page }) => {
    const mock = new MockAdapter(axios);
    // Mock any GET request to /users
    // arguments for reply are (status, data, headers)
    mock.onGet('/users').reply(200, {
      users: [{ id: 1, name: 'John Smith' }],
    });

    axios.get('/users').then(async () => {
      Cookies.set('sessionToken', 'mockToken');
      await page.goto(pagePath);
    });
  });

  test('should display the expected content', async ({ page }) => {
    await expect(page.locator('main')).toHaveText(/Matches/);
  });
});
