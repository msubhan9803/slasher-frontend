import { test, expect } from '@playwright/test';
import { apiUrl } from '../../src/env';

const pagePath = '/app/events/suggestion';

const eventCategoryResponse = [
  {
    _id: '638ef1d21164457367491cd9',
    event_name: 'Art Exhibits',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.807Z',
    updatedAt: '2022-12-06T07:40:02.807Z',
  },
  {
    _id: '638ef1d21164457367491cdb',
    event_name: 'Conventions',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.810Z',
    updatedAt: '2022-12-06T07:40:02.810Z',
  },
  {
    _id: '638ef1d21164457367491cdd',
    event_name: 'Event Calendar',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.812Z',
    updatedAt: '2022-12-06T07:40:02.812Z',
  },
  {
    _id: '638ef1d21164457367491cdf',
    event_name: 'Film Festival',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.814Z',
    updatedAt: '2022-12-06T07:40:02.814Z',
  },
  {
    _id: '638ef1d21164457367491ce1',
    event_name: 'Haunts',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.815Z',
    updatedAt: '2022-12-06T07:40:02.815Z',
  },
  {
    _id: '638ef1d21164457367491ce3',
    event_name: 'Live Music',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.818Z',
    updatedAt: '2022-12-06T07:40:02.818Z',
  },
  {
    _id: '638ef1d21164457367491ce5',
    event_name: 'Market',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.820Z',
    updatedAt: '2022-12-06T07:40:02.820Z',
  },
  {
    _id: '638ef1d21164457367491ce7',
    event_name: 'Party',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.822Z',
    updatedAt: '2022-12-06T07:40:02.822Z',
  },
  {
    _id: '638ef1d21164457367491ce9',
    event_name: 'Tours',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.824Z',
    updatedAt: '2022-12-06T07:40:02.824Z',
  },
  {
    _id: '638ef1d21164457367491ceb',
    event_name: 'Trivia / Game Night',
    status: '1',
    is_deleted: 0,
    createdAt: '2022-12-06T07:40:02.826Z',
    updatedAt: '2022-12-06T07:40:02.826Z',
  },
];

test.use({ storageState: 'e2e/.storage-states/authenticatedUser.json' });

test.describe(pagePath, () => {
  test.beforeEach(({ page }) => {
    page.route(`${apiUrl}/api/v1/event-categories`, (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(eventCategoryResponse),
      });
    });
  });

  test.describe('for a signed-in user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pagePath);
    });

    test('should display the expected content', async ({ page }) => {
      await expect(page.locator('main')).toHaveText(/Conventions/);
    });
  });
});
