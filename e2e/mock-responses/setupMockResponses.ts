/* eslint-disable max-lines */
import { Page } from '@playwright/test';
import { apiUrl } from '../../src/env';

const USER = {
  id: '638ef1b71164457367491b3c',
  userName: 'SampleUser1',
  email: 'sample1@example.com',
  profilePic: 'http://localhost:4000/placeholders/default_user_icon.png',
  firstName: 'Sample1',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzI5NGRmZmI2ODEyNmY5YzcyMThlM2MiLCJ1c2VyVHlwZSI6IjEiLCJwYXNzd29yZENoYW5nZWRBdCI6IjIwMjItMDktMjBUMDU6MjI6MDcuNzYxWiIsImlhdCI6MTY2MzczMTg5Nn0._eVEZJZ2ldXOPsjfWJwOb7JPI0jbsjzwzphC7eCmdYU',
};

function mockSignInResponse(page: Page) {
  page.route(`${apiUrl}/api/v1/users/sign-in`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: USER.id,
        userName: USER.userName,
        email: USER.email,
        firstName: USER.firstName,
        token: USER.token,
      }),
    });
  });
}

function mockInitialDataResponse(page: Page) {
  page.route(`${apiUrl}/api/v1/users/initial-data`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        unreadNotificationCount: 0,
        unreadMessageCount: 0,
        recentMessages: [],
        friendRequestCount: 0,
        recentFriendRequests: [],
        user: {
          id: USER.id,
          userName: USER.userName,
          profilePic: USER.profilePic,
        },

      }),
    });
  });
}
function mockRemoteConstantsResponse(page: Page) {
  page.route(`${apiUrl}/api/v1/remote-constants`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        placeholderUrlNoImageAvailable: 'http://localhost:4000/placeholders/no_image_available.png',
      }),
    });
  });
}
function mockSuggestedFriendsResponse(page: Page) {
  page.route(`${apiUrl}/api/v1/users/suggested-friends`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(
        [
          {
            _id: '6414507b52422f0018f1d0db',
            userName: 'tecstar',
            profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
          },
          {
            _id: '64141f011b1b5100188072e6',
            userName: 'DonavanJames',
            profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
          },
          {
            _id: '64141af71b1b510018807291',
            userName: 'Mollie___GRACE',
            profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
          },
        ],
      ),
    });
  });
}
// Note: Do not remove items from this list else a second request would be made with
// url ending with `&aftter=somePostId` and we don't have mock api for that yet.
function mockFeedPostsResponse(page: Page) {
  page.route(`${apiUrl}/api/v1/feed-posts?limit=10`, (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(
        [
          {
            _id: '6428ab4b0fe910d27d4cca51',
            message: 'Test post',
            createdAt: '2023-04-01T22:08:12.001Z',
            lastUpdateAt: '2023-04-07T04:10:33.425Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 1,
            likeCount: 1,
            likedByUser: false,
          },
          {
            _id: '641d1969d83da3c8b64ba276',
            message: 'horror from local',
            createdAt: '2023-03-24T03:30:49.678Z',
            lastUpdateAt: '2023-04-03T13:41:19.302Z',
            rssfeedProviderId: null,
            images: [
              {
                image_path: '/logo512.png',
                _id: '641d1969d83da3c8b64ba277',
              },
            ],
            userId: {
              _id: '63ab684096b28d00122ec0de',
              userName: 'slasher-test-user1',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
            },
            commentCount: 22,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '642063d805238e98b4e27b4c',
            message: '. .',
            createdAt: '2023-03-26T15:25:12.089Z',
            lastUpdateAt: '2023-03-30T00:59:07.465Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '6422428c05238e98b4eee501',
            message: '',
            createdAt: '2023-03-28T01:27:40.733Z',
            lastUpdateAt: '2023-03-28T01:27:40.732Z',
            rssfeedProviderId: null,
            images: [
              {
                image_path: '/logo512.png',
                _id: '6422428c05238e98b4eee502',
              },
              {
                image_path: '/logo512.png',
                _id: '6422428c05238e98b4eee503',
              },
              {
                image_path: '/logo512.png',
                _id: '6422428c05238e98b4eee504',
              },
              {
                image_path: '/logo512.png',
                _id: '6422428c05238e98b4eee505',
              },
            ],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '64205af605238e98b4e22576',
            message: '',
            createdAt: '2023-03-26T14:47:18.087Z',
            lastUpdateAt: '2023-03-26T14:47:18.085Z',
            rssfeedProviderId: null,
            images: [
              {
                image_path: '/logo512.png',
                _id: '64205af605238e98b4e22577',
              },
            ],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 2,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '641e153105238e98b4e118a4',
            message: 'Test post',
            createdAt: '2023-03-24T21:25:05.234Z',
            lastUpdateAt: '2023-03-24T21:25:05.232Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '641e149c05238e98b4e0ffcf',
            message: 'Post from profile',
            createdAt: '2023-03-24T21:22:36.357Z',
            lastUpdateAt: '2023-03-24T21:22:36.356Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '641d16f85284352d0555a3f4',
            message: 'image with a post from localhost',
            createdAt: '2023-03-24T03:20:24.710Z',
            lastUpdateAt: '2023-03-24T03:20:24.708Z',
            rssfeedProviderId: null,
            images: [
              {
                image_path: '/logo512.png',
                _id: '641d16f85284352d0555a3f5',
              },
            ],
            userId: {
              _id: '63ab684096b28d00122ec0de',
              userName: 'slasher-test-user1',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '641bcc540f89e185cf37b994',
            message: 'https://app-staging.slasher.tv/app/movies\r\n\r\ngoogle.com',
            createdAt: '2023-03-23T03:49:40.923Z',
            lastUpdateAt: '2023-03-23T03:50:20.568Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
          {
            _id: '641afe6eab48ceb4991ee0c3',
            message: 'Post to test editing images after text only post',
            createdAt: '2023-03-22T13:11:10.127Z',
            lastUpdateAt: '2023-03-22T13:12:00.227Z',
            rssfeedProviderId: null,
            images: [],
            userId: {
              _id: '5cf146426038e206a2fe681b',
              userName: 'Damon',
              profilePic: 'https://d13qdlbrji2lqg.cloudfront.net/profile/profile_3wz9ckkpx5k.jpg',
            },
            commentCount: 0,
            likeCount: 0,
            likedByUser: false,
          },
        ],
      ),
    });
  });
}
export default function setupMockResponses(page: Page) {
  mockSignInResponse(page);
  mockInitialDataResponse(page);
  mockRemoteConstantsResponse(page);
  mockSuggestedFriendsResponse(page);
  mockFeedPostsResponse(page);
}
