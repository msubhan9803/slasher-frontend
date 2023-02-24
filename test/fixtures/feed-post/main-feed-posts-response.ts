import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

export default [
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 1',
    createdAt: '2022-10-17T00:00:00.000Z',
    rssfeedProviderId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      logo: null,
      title: 'RssFeedProvider 1',
    },
    images: [
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
    ],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username1',
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    },
    commentCount: 0,
    likeCount: 0,
    likes: [],
    lastUpdateAt: '2022-10-20T00:00:00.000Z',
  },
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 2',
    createdAt: '2022-10-18T00:00:00.000Z',
    rssfeedProviderId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      logo: null,
      title: 'RssFeedProvider 2',
    },
    images: [
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
    ],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username2',
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    },
    commentCount: 0,
    likeCount: 0,
    likes: [],
    lastUpdateAt: '2022-10-19T00:00:00.000Z',
  },
];
