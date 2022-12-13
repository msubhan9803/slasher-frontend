import { Page } from '@playwright/test';
import { apiUrl } from '../../src/api/constants';

function mockSignInResponse(page: Page) {
  page.route(`${apiUrl}/users/sign-in`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        userName: 'SampleUser1',
        id: '638ef1b71164457367491b3c',
        email: 'sample1@example.com',
        firstName: 'Sample1',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzI5NGRmZmI2ODEyNmY5YzcyMThlM2MiLCJ1c2VyVHlwZSI6IjEiLCJwYXNzd29yZENoYW5nZWRBdCI6IjIwMjItMDktMjBUMDU6MjI6MDcuNzYxWiIsImlhdCI6MTY2MzczMTg5Nn0._eVEZJZ2ldXOPsjfWJwOb7JPI0jbsjzwzphC7eCmdYU',
      }),
    });
  });
}

function mockInitialDataResponse(page: Page) {
  page.route(`${apiUrl}/users/initial-data`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        userId: '638ef1b71164457367491b3c',
        userName: 'SampleUser1',
        unreadNotificationCount: 0,
        recentMessages: [],
        friendRequestCount: 0,
        recentFriendRequests: [],
      }),
    });
  });
}

export default function setupMockResponses(page: Page) {
  mockSignInResponse(page);
  mockInitialDataResponse(page);
}
