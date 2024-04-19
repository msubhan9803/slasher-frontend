import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

export default [
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    likeCount: 0,
    likedByUser: false,
    hashtags: [],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username2',
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    },
    bookId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 3',
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
    commentCount: 0,
    postType: 4,
    spoilers: false,
    createdAt: expect.any(String),
  },
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    likeCount: 0,
    likedByUser: false,
    hashtags: [],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username3',
      profilePic: expect.any(String),
    },
    bookId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 2',
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
    commentCount: 0,
    postType: 4,
    spoilers: false,
    createdAt: expect.any(String),
    reviewData: { rating: 4, goreFactorRating: 3, worthReading: 1 },
  },
  {
    _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    likeCount: 0,
    likedByUser: false,
    hashtags: [],
    userId: {
      _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      userName: 'Username1',
      profilePic: expect.any(String),
    },
    bookId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    message: 'Message 1',
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
    commentCount: 0,
    postType: 4,
    spoilers: false,
    createdAt: expect.any(String),
    reviewData: { rating: 4, goreFactorRating: 4, worthReading: 1 },
  },
];
