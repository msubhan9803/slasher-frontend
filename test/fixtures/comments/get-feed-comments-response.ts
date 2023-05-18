/* eslint-disable max-len */

export default [
  {
    _id: expect.any(String),
    createdAt: expect.any(String),
    feedPostId: expect.any(String),
    images: [
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this is feed comments with replies description 1',
      }, {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this is feed comments with replies description 2',
      },
    ],
    likeCount: 3,
    likedByUser: false,
    message: 'Comment 2',
    replies: [
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
            description: 'this is feed comments with replies description 1',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            description: 'this is feed comments with replies description 2',
          },
        ],
        likeCount: 2,
        likedByUser: false,
        message: 'Hello Comment 2 Test Reply Message 2',
        userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
      },
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
            description: 'this is feed comments with replies description 1',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            description: 'this is feed comments with replies description 2',
          },
        ],
        likeCount: 2,
        likedByUser: false,
        message: 'Hello Comment 2 Test Reply Message 4',
        userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
      },
    ],
    userId: { _id: expect.any(String), profilePic: 'http://localhost:4444/placeholders/default_user_icon.png', userName: 'Username1' },
  },
  {
    _id: expect.any(String),
    createdAt: expect.any(String),
    feedPostId: expect.any(String),
    images: [
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this is feed comments with replies description 1',
      },
      {
        _id: expect.any(String),
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this is feed comments with replies description 2',
      },
    ],
    likeCount: 5,
    likedByUser: true,
    message: 'Comment 1',
    replies: [
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
            description: 'this is feed comments with replies description 1',
          },
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            description: 'this is feed comments with replies description 2',
          },
        ],
        likeCount: 2,
        likedByUser: true,
        message: 'Hello Comment 1 Test Reply Message 1',
        userId: {
          _id: expect.any(String),
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: 'Username1',
        },
      },
      {
        _id: expect.any(String),
        createdAt: expect.any(String),
        feedCommentId: expect.any(String),
        feedPostId: expect.any(String),
        images: [
          {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/id/237/200/300',
            description: 'this is feed comments with replies description 1',
          }, {
            _id: expect.any(String),
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            description: 'this is feed comments with replies description 2',
          },
        ],
        likeCount: 2,
        likedByUser: true,
        message: 'Hello Comment 1 Test Reply Message 3',
        userId: {
          _id: expect.any(String),
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: 'Username1',
        },
      }],
    userId: {
      _id: expect.any(String),
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
      userName: 'Username1',
    },
  },
];
