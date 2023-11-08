/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { Image } from '../../../../../src/schemas/shared/image.schema';

describe('GET /users/:id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let otherUserAuthToken: string;
  let otherUser: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
  });

  describe('GET /api/v1/users/:userNameOrId', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );

      otherUser = await usersService.create(userFactory.build({
        profile_status: ProfileVisibility.Private,
      }));
      otherUserAuthToken = otherUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/users/${userId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Find a user by id', () => {
      it('returns the expected response when logged in users requests their own user data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Public,
          email: 'User1@Example.com',
          unverifiedNewEmail: null,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });

      it('returns the expected response (omitting email field) when logged in users requests different user data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        // Hide email for users other than active user
        expect(response.body.email).toBeUndefined();
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: 0,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${nonExistentUserId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('returns the expected response when logged in users requests their own user data with private profile status', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${otherUser.id}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: otherUser.id,
          firstName: 'First name 2',
          userName: 'Username2',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Private,
          email: 'User2@Example.com',
          unverifiedNewEmail: null,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });
    });
    describe('Find a user by userName', () => {
      it('returns the expected user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.userName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Public,
          email: 'User1@Example.com',
          unverifiedNewEmail: null,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });

      it('returns the expected response when logged in users requests their own user data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${otherUser.userName}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: otherUser.id,
          firstName: 'First name 2',
          userName: 'Username2',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Private,
          email: 'User2@Example.com',
          unverifiedNewEmail: null,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserName = `No${activeUser.userName}`;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${nonExistentUserName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('returns the expected user and omit email field for other user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.userName}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        // Hide email for users other than active user
        expect(response.body.email).toBeUndefined();
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: 0,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });

      it('returns the expected user with private profile status', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${otherUser.userName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: 'First name 2',
          userName: 'Username2',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: null,
          profile_status: ProfileVisibility.Private,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      });
    });

    it('returns the expected response when block exists between users', async () => {
      await blocksModel.create({
        from: activeUser.id,
        to: otherUser._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${otherUser._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'User not found',
        statusCode: 403,
      });
    });

    it(
      'returns the expected response (omitting email field) when a logged in user requests a different users PRIVATE profile',
      async () => {
        const user0 = await usersService.create(userFactory.build({
          profile_status: 1,
        }));
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user0.id}`)
          .auth(otherUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: 'First name 3',
          userName: 'Username3',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: null,
          profile_status: 1,
          friendshipStatus: {
            reaction: null,
            from: null,
            to: null,
          },
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
          watchedListMovieCount: 0,
        });
      },
    );

    it('when loggedInUser or otherUser is friend than expected response', async () => {
      const user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
      await friendsService.createFriendRequest(activeUser.id, user1.id);
      await friendsService.acceptFriendRequest(activeUser.id, user1.id);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        firstName: 'First name 3',
        userName: 'Michael',
        profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        coverPhoto: null,
        aboutMe: 'Hello. This is me.',
        profile_status: ProfileVisibility.Public,
        friendshipStatus: {
          reaction: FriendRequestReaction.Accepted,
          from: activeUser.id,
          to: user1.id,
        },
        friendsCount: 1,
        imagesCount: 0,
        postsCount: 0,
        watchedListMovieCount: 0,
      });
    });

    it('Get friendsCount, imagesCount and postsCount', async () => {
      const user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
      await friendsService.createFriendRequest(activeUser.id, user1.id);
      await friendsService.acceptFriendRequest(activeUser.id, user1.id);

      const sampleFeedPostImages: Image[] = [
        {
          image_path: '/feed/feed_sample1.jpg',
          description: 'this is image description',
        },
        {
          image_path: '/feed/feed_sample2.jpg',
          description: 'this is image description',
        },
      ];

      // Create 5 posts with 2 images each
      for (let i = 0; i < 5; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            images: sampleFeedPostImages,
          }),
        );
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        firstName: activeUser.firstName,
        email: 'User1@Example.com',
        userName: activeUser.userName,
        profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        coverPhoto: null,
        aboutMe: activeUser.aboutMe,
        profile_status: ProfileVisibility.Public,
        unverifiedNewEmail: null,
        friendshipStatus: {
          reaction: null,
          from: null,
          to: null,
        },
        friendsCount: 1,
        imagesCount: 10,
        postsCount: 5,
        watchedListMovieCount: 0,
      });
    });
  });
});
