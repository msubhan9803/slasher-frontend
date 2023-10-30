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
        description: 'this is test description',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        description: 'this is test description',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
    ],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username1',
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    },
    commentCount: 0,
    likeCount: 2,
    likedByUser: true,
    lastUpdateAt: '2022-10-20T00:00:00.000Z',
    movieId: null,
    bookId: null,
    hashtags: [],
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
        description: 'this is test description',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        description: 'this is test description',
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
    likedByUser: false,
    lastUpdateAt: '2022-10-19T00:00:00.000Z',
    movieId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      logo: 'https://picsum.photos/id/237/200/300',
      name: 'Shawshank Redemption',
      releaseDate: '2022-10-17T00:00:00.000Z',
    },
    bookId: null,
    hashtags: [],
  },
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 3',
    createdAt: '2022-10-19T00:00:00.000Z',
    rssfeedProviderId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      logo: null,
      title: 'RssFeedProvider 2',
    },
    images: [
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        description: 'this is test description',
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      },
      {
        image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
        description: 'this is test description',
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
    likedByUser: false,
    lastUpdateAt: '2022-10-18T00:00:00.000Z',
    movieId: null,
    bookId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      logo: 'https://picsum.photos/id/237/200/300',
      name: 'Dracula',
      publishDate: '2022-10-17T00:00:00.000Z',
    },
    hashtags: [],
  },
];
