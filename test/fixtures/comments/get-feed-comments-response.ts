/* eslint-disable max-len */

export default [
  {
    _id: expect.any(String),
    createdAt: expect.any(String),
    feedPostId: expect.any(String),
    hideUsers: [],
    images: [
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/id/237/200/300',
      }, {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/seed/picsum/200/300',
      },
    ],
    is_deleted: 0,
    likeCount: 3,
    likedByUser: false,
    message: 'Comment 2',
    replies: [
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        deleted: 0,
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        hideUsers: [],
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        likeCount: 2,
        likedByUser: false,
        message: 'Hello Comment 2 Test Reply Message 1',
        reportUsers: [],
        status: 1,
        type: 0,
        updatedAt: expect.any(String),
        userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
      },
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        deleted: 0,
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        hideUsers: [],
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        likeCount: 2,
        likedByUser: false,
        message: 'Hello Comment 2 Test Reply Message 2',
        reportUsers: [],
        status: 1,
        type: 0,
        updatedAt: expect.any(String),
        userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
      },
    ],
    reportUsers: [],
    status: 1,
    type: 1,
    updatedAt: expect.any(String),
    userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
  },
  {
    _id: expect.any(String),
    createdAt: expect.any(String),
    feedPostId: expect.any(String),
    hideUsers: [],
    images: [
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/seed/picsum/200/300',
      },
    ],
    is_deleted: 0,
    likeCount: 5,
    likedByUser: true,
    message: 'Comment 1',
    replies: [
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        deleted: 0,
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        hideUsers: [],
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
          },
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        likeCount: 2,
        likedByUser: true,
        message: 'Hello Comment 1 Test Reply Message 1',
        reportUsers: [],
        status: 1,
        type: 0,
        updatedAt: expect.any(String),
        userId: {
          _id: expect.any(String),
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: 'Username1',
        },
      },
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        deleted: 0,
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        hideUsers: [],
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        likeCount: 2,
        likedByUser: true,
        message: 'Hello Comment 1 Test Reply Message 2',
        reportUsers: [],
        status: 1,
        type: 0,
        updatedAt: expect.any(String),
        userId: {
          _id: expect.any(String),
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: 'Username1',
        },
      }],
    reportUsers: [],
    status: 1,
    type: 1,
    updatedAt: expect.any(String),
    userId: {
      _id: expect.any(String),
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
      userName: 'Username1',
    },
  },
];
