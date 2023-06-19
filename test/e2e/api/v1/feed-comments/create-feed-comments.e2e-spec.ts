/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable max-lines */
import * as request from 'supertest';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';
import { NotificationType } from '../../../../../src/schemas/notification/notification.enums';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';

describe('Feed-Comments / Comments File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let rssFeedProvidersService: RssFeedProvidersService;
  let userSettingsService: UserSettingsService;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);

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

  describe('POST /api/v1/feed-comments', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(feedPostFactory.build({ userId: activeUser._id }));
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/feed-comments').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('with mocked notificationsService.create', () => {
      beforeEach(async () => {
        jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      });

      it('returns the expected response upon successful request', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .attach('images', tempPaths[2])
            .attach('images', tempPaths[3])
            .field('imageDescriptions[0][description]', 'this is create feed comment description 0')
            .field('imageDescriptions[1][description]', 'this is create feed comment description 1')
            .field('imageDescriptions[2][description]', 'this is create feed comment description 2')
            .field('imageDescriptions[3][description]', 'this is create feed comment description 3')
            .expect(HttpStatus.CREATED);
          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            feedPostId: feedPost._id.toString(),
            message: 'hello test user',
            userId: activeUser._id.toString(),
            images: [
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comment description 0',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comment description 1',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comment description 2',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comment description 3',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('responds expected response when one or more uploads files user an unallowed extension', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .attach('images', tempPaths[2])
            .attach('images', tempPaths[3])
            .expect(HttpStatus.BAD_REQUEST);
          expect(response.body.message).toBe(`Unsupported file type: ${path.basename(tempPaths[1])}`);
        }, [{ extension: 'png' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('allows the creation of a comments with only a message, but no files', async () => {
        const message = 'This is a test message';
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', message)
          .field('feedPostId', feedPost._id.toString())
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: 'This is a test message',
          userId: activeUser._id.toString(),
          images: [],
        });
      });

      it('responds expected response when neither message nor file are present in request', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', '')
          .field('feedPostId', feedPost._id.toString())
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Comments must have some text or at least one image.');
      });

      it('when files length is not equal imageDescriptions length than expected response', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .attach('images', tempPaths[2])
            .field('imageDescriptions[0][description]', 'this is create feed comments description 1')
            .field('imageDescriptions[1][description]', 'this is create feed comments description 2');
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'files length and imagesDescriptions length should be same',
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('when imageDescriptions is empty string than expected response', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .field('imageDescriptions[0][description]', '')
            .expect(HttpStatus.CREATED);
          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            feedPostId: feedPost._id.toString(),
            message: 'hello test user',
            userId: activeUser._id.toString(),
            images: [
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: null,
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('cannot add more than 4 description on comments', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('imageDescriptions[0][description]', 'this is create feed comments description 0')
          .field('imageDescriptions[1][description]', 'this is create feed comments description 1')
          .field('imageDescriptions[2][description]', 'this is create feed comments description 2')
          .field('imageDescriptions[3][description]', 'this is create feed comments description 3')
          .field('imageDescriptions[4][description]', 'this is create feed comments description 4')
          .field('imageDescriptions[5][description]', 'this is create feed comments description 5');
        expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Only allow maximum of 4 description');
      });

      it('check description length validation', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('imageDescriptions[0][description]', new Array(252).join('z'))
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('description cannot be longer than 250 characters');
      });

      it('allows the creation of a comments with only files, but no message', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')

            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .field('imageDescriptions[0][description]', 'this is create feed comments description 1')
            .field('imageDescriptions[1][description]', 'this is create feed comments description 2');
          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            feedPostId: feedPost._id.toString(),
            message: null,
            userId: activeUser._id.toString(),
            images: [
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comments description 1',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed comments description 2',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('only allows a maximum of four images', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .attach('images', tempPaths[2])
            .attach('images', tempPaths[3])
            .attach('images', tempPaths[4])
            .attach('images', tempPaths[5])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body).toEqual({ statusCode: 400, message: 'Too many files uploaded. Maximum allowed: 4' });
        }, [
          { extension: 'png' },
          { extension: 'jpg' },
          { extension: 'jpg' },
          { extension: 'png' },
          { extension: 'png' },
          { extension: 'png' },
        ]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('responds expected response if file size should not larger than 20MB', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')

            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .expect(HttpStatus.PAYLOAD_TOO_LARGE);
          expect(response.body.message).toBe('File too large');
        }, [{ extension: 'png' },
        { extension: 'jpg', size: 1024 * 1024 * 21 }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('check message length validation', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', new Array(8002).join('z'))

            .field('feedPostId', feedPost._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .expect(HttpStatus.BAD_REQUEST);
          expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
        }, [{ extension: 'png' }, { extension: 'jpg' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('returns the expected error response if the post cannot be found', async () => {
        const nonExistentPostId = '239ae2550dae24b30c70f6c7';
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'Hello')
          .field('feedPostId', nonExistentPostId)
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain('Post not found');
      });

      it('when a block exists between the post creator and the commenter, it returns the expected response', async () => {
        const user1 = await usersService.create(userFactory.build({}));
        const feedPost1 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user1._id,
            },
          ),
        );
        await friendsService.createFriendRequest(activeUser._id.toString(), user1.id);
        await friendsService.acceptFriendRequest(activeUser._id.toString(), user1.id);

        await blocksModel.create({
          from: activeUser._id,
          to: user1._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedPostId', feedPost1._id.toString());
        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'Request failed due to user block.',
          statusCode: HttpStatus.FORBIDDEN,
        });
      });

      it('check trim is working for message in create feed comments', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', '     this is new post comment  ')
          .field('userId', activeUser._id.toString())
          .field('feedPostId', feedPost._id.toString());
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: 'this is new post comment',
          userId: activeUser._id.toString(),
          images: [],
        });
      });

      it('returns the expected response when the message only contains whitespace characters', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', '     \n\n')
          .field('userId', activeUser._id.toString())
          .field('feedPostId', feedPost._id.toString());
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'Comments must have some text or at least one image.',
        });
      });

      it('sends the expected notifications when the commenter user is not the post creator user', async () => {
        const postCreatorUser = await usersService.create(userFactory.build());
        const otherUser1 = await usersService.create(userFactory.build());
        const otherUser1AuthToken = otherUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        await friendsService.createFriendRequest(otherUser1._id.toString(), postCreatorUser.id);
        await friendsService.acceptFriendRequest(otherUser1._id.toString(), postCreatorUser.id);
        await request(app.getHttpServer())
          .post('/api/v1/feed-comments').auth(otherUser1AuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(1);

        // TODO: Uncomment and fix lines below

        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: response.body._id,
        //   senderId: otherUser1._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'replied to a comment on your post',
        // });
      });

      it('sends the expected notifications when postType is movieReview', async () => {
        const postCreatorUser = await usersService.create(userFactory.build());
        const otherUser1 = await usersService.create(userFactory.build());
        const otherUser1AuthToken = otherUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        const post = await feedPostsService.create(feedPostFactory.build({
          userId: postCreatorUser._id,
          postType: PostType.MovieReview,
        }));
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments').auth(otherUser1AuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(1);
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: postCreatorUser._id,
          feedPostId: new mongoose.Types.ObjectId(response.body.feedPostId),
          feedCommentId: new mongoose.Types.ObjectId(response.body._id),
          senderId: otherUser1._id,
          allUsers: [otherUser1._id],
          notifyType: NotificationType.UserCommentedOnYourPost,
          notificationMsg: 'commented on your movie review',
        });
      });

      it('does not send any notifications when the commenter user is the post creator user', async () => {
        const postCreatorUser1 = await usersService.create(userFactory.build());
        const postCreatorAuthToken1 = postCreatorUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser1._id }));
        await request(app.getHttpServer())
          .post('/api/v1/feed-comments').auth(postCreatorAuthToken1, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(0);
        // TODO: Examine notificationsService.create() arguments in greater detail to make sure the right ones went to the right users
      });

      it('sends the expected notifications when the commenter user is not the post creator user, '
        + 'AND there are three users mentioned in the message and one is the post creator', async () => {
          const postCreatorUser = await usersService.create(userFactory.build());
          const otherUser2 = await usersService.create(userFactory.build());
          const otherUser3 = await usersService.create(userFactory.build());
          const otherUser4 = await usersService.create(userFactory.build());
          const otherUser2AuthToken = otherUser2.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
          const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
          await friendsService.createFriendRequest(otherUser2._id.toString(), postCreatorUser.id);
          await friendsService.acceptFriendRequest(otherUser2._id.toString(), postCreatorUser.id);
          await request(app.getHttpServer())
            .post('/api/v1/feed-comments').auth(otherUser2AuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('feedPostId', post._id.toString())
            .field(
              'message',
              `##LINK_ID##${postCreatorUser._id.toString()}@PostCreatorUser##LINK_END## post creator user`
              + `##LINK_ID##${otherUser3._id.toString()}@OtherUser3##LINK_END## other user 3`
              + `##LINK_ID##${otherUser4._id.toString()}@OtherUser4##LINK_END## other user 4`,
            )
            .expect(HttpStatus.CREATED);

          expect(notificationsService.create).toHaveBeenCalledTimes(3);
          // TODO: Examine notificationsService.create() arguments in greater detail to make sure the right ones went to the right users
        });

      it('when add a comment to a post than check update post lastUpdateAt value', async () => {
        const postBeforeUpdate = await feedPostsService.findById(feedPost._id.toString(), false);
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('feedPostId', feedPost._id.toString());
        const postAfterUpdate = await feedPostsService.findById(response.body.feedPostId, false);
        expect(postAfterUpdate.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBeTruthy();
      });

      describe('when the feed post was created by a user with a non-public or non-private profile', () => {
        let user1;
        let feedPost1;
        beforeEach(async () => {
          user1 = await usersService.create(userFactory.build({
            profile_status: ProfileVisibility.Private,
          }));
          feedPost1 = await feedPostsService.create(
            feedPostFactory.build(
              {
                userId: user1._id,
              },
            ),
          );
        });

        it('should not allow the creation of a feed comments when commenter is not a friend of the post creator', async () => {
          await createTempFiles(async (tempPaths) => {
            const response = await request(app.getHttpServer())
              .post('/api/v1/feed-comments')
              .auth(activeUserAuthToken, { type: 'bearer' })
              .set('Content-Type', 'multipart/form-data')
              .field('message', 'hello test user')
              .field('feedPostId', feedPost1._id.toString())
              .attach('images', tempPaths[0])
              .attach('images', tempPaths[1]);
            expect(response.status).toBe(HttpStatus.FORBIDDEN);
            expect(response.body).toEqual({ statusCode: 403, message: 'You can only interact with posts of friends.' });
          }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
        });

        it('should not allow the creation of a feed comments when commenter'
          + 'is not a friend of the post creator and user with a public profile', async () => {
            const user3 = await usersService.create(userFactory.build({
              profile_status: ProfileVisibility.Public,
            }));
            const feedPost3 = await feedPostsService.create(
              feedPostFactory.build(
                {
                  userId: user3._id,
                },
              ),
            );
            await createTempFiles(async (tempPaths) => {
              const response = await request(app.getHttpServer())
                .post('/api/v1/feed-comments')
                .auth(activeUserAuthToken, { type: 'bearer' })
                .set('Content-Type', 'multipart/form-data')
                .field('message', 'hello test user')
                .field('feedPostId', feedPost3._id.toString())
                .attach('images', tempPaths[0])
                .attach('images', tempPaths[1]);
              expect(response.status).toBe(HttpStatus.FORBIDDEN);
              expect(response.body).toEqual({ statusCode: 403, message: 'You can only interact with posts of friends.' });
            }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
          });

        it('should allow the creation of a feed comments when commenter is a friend of the post creator', async () => {
          const user4 = await usersService.create(userFactory.build({
            profile_status: ProfileVisibility.Private,
          }));
          const feedPost4 = await feedPostsService.create(
            feedPostFactory.build(
              {
                userId: user4._id,
              },
            ),
          );
          await friendsService.createFriendRequest(activeUser._id.toString(), user4.id);
          await friendsService.acceptFriendRequest(activeUser._id.toString(), user4.id);
          await createTempFiles(async (tempPaths) => {
            const response = await request(app.getHttpServer())
              .post('/api/v1/feed-comments')
              .auth(activeUserAuthToken, { type: 'bearer' })
              .set('Content-Type', 'multipart/form-data')
              .field('message', 'hello test user')
              .field('feedPostId', feedPost4._id.toString())
              .attach('images', tempPaths[0])
              .field('imageDescriptions[0][description]', 'this is create feed comment description 0');
            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body).toEqual({
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              feedPostId: feedPost4._id.toString(),
              message: 'hello test user',
              userId: activeUser._id.toString(),
              images: [
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  description: 'this is create feed comment description 0',
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                },
              ],
            });
          }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
        });

        it('when post has an rssfeedProviderId, it returns a successful response', async () => {
          const rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
          const feedPost2 = await feedPostsService.create(
            feedPostFactory.build({
              userId: rssFeedProvider._id,
              rssfeedProviderId: rssFeedProvider._id,
            }),
          );
          await createTempFiles(async (tempPaths) => {
            const response = await request(app.getHttpServer())
              .post('/api/v1/feed-comments')
              .auth(activeUserAuthToken, { type: 'bearer' })
              .set('Content-Type', 'multipart/form-data')
              .field('message', 'hello test user')
              .field('feedPostId', feedPost2._id.toString())
              .attach('images', tempPaths[0])
              .attach('images', tempPaths[1])
              .field('imageDescriptions[0][description]', 'this is create feed comment description 0')
              .field('imageDescriptions[1][description]', 'this is create feed comment description 1');
            expect(response.body).toEqual({
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              feedPostId: feedPost2._id.toString(),
              message: 'hello test user',
              userId: activeUser._id.toString(),
              images: [
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  description: 'this is create feed comment description 0',
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                },
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  description: 'this is create feed comment description 1',
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                },
              ],
            });
          }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
        });
      });
    });
    describe('notifications', () => {
      let otherUser1;
      let otherUser1AuthToken;
      let otherUser2;
      beforeEach(async () => {
        otherUser1 = await usersService.create(userFactory.build());
        otherUser1AuthToken = otherUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser2 = await usersService.create(userFactory.build());
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: otherUser2._id,
            },
          ),
        );
      });

      it('when notification is create for createFeedComments than check newNotificationCount is increment in user', async () => {
        const user0 = await usersService.create(userFactory.build({ userName: 'Divine' }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: user0._id,
            },
          ),
        );
        const post = await feedPostsService.create(feedPostFactory.build({ userId: user0._id }));
        await friendsService.createFriendRequest(otherUser1._id.toString(), user0.id);
        await friendsService.acceptFriendRequest(otherUser1._id.toString(), user0.id);
        await request(app.getHttpServer())
          .post('/api/v1/feed-comments').auth(otherUser1AuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field(
            'message',
            `##LINK_ID##${user0._id.toString()}@Divine##LINK_END## post creator user`
            + `##LINK_ID##${otherUser2._id.toString()}@OtherUser2##LINK_END## other user 2`,
          )
          .expect(HttpStatus.CREATED);

        const user0NewNotificationCount = await usersService.findById(user0.id, true);
        const otherUser2NewNotificationCount = await usersService.findById(otherUser2.id, true);

        expect(user0NewNotificationCount.newNotificationCount).toBe(1);
        expect(otherUser2NewNotificationCount.newNotificationCount).toBe(1);
      });
    });
  });
});
