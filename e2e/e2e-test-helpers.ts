/* eslint-disable import/prefer-default-export */
import { Page } from '@playwright/test';
import { apiUrl } from '../src/api/constants';

export async function performSignIn(page: Page) {
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

  await page.goto('/sign-in');
  await page.locator('input[name="emailOrUsername"]').fill('sample1@example.com');
  await page.locator('input[name="password"]').fill('test@123');
  await page.locator('#sign-in-button >> text=Sign in').click();
}
