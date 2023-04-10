/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
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
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { FeedComment } from '../../../../../src/schemas/feedComment/feedComment.schema';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Feed-Comments/Replies File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let feedPost: FeedPostDocument;
  let feedComment: FeedComment;
  let rssFeedProvidersService: RssFeedProvidersService;

  const sampleFeedReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this create feed reply description 1',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this create feed reply description 2',
      },
    ],
    message: 'Hello Reply Test Message 1',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));

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

  describe('POST /api/v1/feed-comments/replies', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/feed-comments/replies').expect(HttpStatus.UNAUTHORIZED);
    });

    beforeEach(async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(feedPostFactory.build({ userId: activeUser._id }));
      feedComment = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: sampleFeedReplyObject.message,
            images: sampleFeedReplyObject.images,
          },
        ),
      );
    });

    it('returns the expected response upon successful request', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .field('imageDescriptions[0][description]', 'this is create feed reply description 1')
          .field('imageDescriptions[1][description]', 'this is create feed reply description 2')
          .field('imageDescriptions[2][description]', 'this is create feed reply description 3')
          .field('imageDescriptions[3][description]', 'this is create feed reply description 4')
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          feedCommentId: feedComment._id.toString(),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 3',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 4',
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
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Invalid file type');
      }, [{ extension: 'png' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('allows the creation of a reply with only a message, but no files', async () => {
      const message = 'This is a test message';
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message)
        .field('feedCommentId', feedComment._id.toString())
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedPostId: feedPost._id.toString(),
        feedCommentId: feedComment._id.toString(),
        message: 'This is a test message',
        userId: activeUser._id.toString(),
        images: [],
      });
    });

    it('allows the creation of a reply with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is create feed reply description 1')
          .field('imageDescriptions[1][description]', 'this is create feed reply description 2');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedCommentId: feedComment._id.toString(),
          feedPostId: feedPost._id.toString(),
          message: null,
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is create feed reply description 2',
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
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
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
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toBe('File too large');
      }, [{ extension: 'png' }, { extension: 'jpg', size: 1024 * 1024 * 21 }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('check message length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', new Array(8002).join('z'))
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when a block exists between the comment creator and the reply creator, it returns the expected response', async () => {
      const postCreatorUser = await usersService.create(userFactory.build({}));
      const commentCreatorUser = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: postCreatorUser._id,
          },
        ),
      );
      const feedComment1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: commentCreatorUser._id,
            feedPostId: feedPost1.id,
            message: sampleFeedReplyObject.message,
            images: sampleFeedReplyObject.images,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id,
        to: commentCreatorUser._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', 'hello test user')
        .field('feedCommentId', feedComment1._id.toString());
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block (comment owner).',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('when a block exists between the post creator and the reply creator, it returns the expected response', async () => {
      const postCreatorUser = await usersService.create(userFactory.build({}));
      const commentCreatorUser = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: postCreatorUser._id,
          },
        ),
      );
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: commentCreatorUser._id,
            feedPostId: feedPost1.id,
            message: sampleFeedReplyObject.message,
            images: sampleFeedReplyObject.images,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id,
        to: postCreatorUser._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', 'hello test user')
        .field('feedCommentId', feedComments1._id.toString());
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block (post owner).',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('returns the expected error response if the comment cannot be found', async () => {
      const nonExistentCommentId = '239ae2550dae24b30c70f6c7';
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', 'Hello')
        .field('feedCommentId', nonExistentCommentId)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('Comment not found');
    });

    it('check trim is working for message in create feed reply', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', '        This is a test reply message      ')
        .field('feedCommentId', feedComment._id.toString());
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedCommentId: feedComment._id.toString(),
        feedPostId: feedPost._id.toString(),
        message: 'This is a test reply message',
        userId: activeUser._id.toString(),
        images: [],
      });
    });

    it('returns the expected response when the message only contains whitespace characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '     \n\n')
        .field('feedCommentId', feedComment._id.toString());
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Replies must have some text or at least one image.',
      });
    });

    it('when files length is not equal imageDescriptions length than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
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
          .post('/api/v1/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComment._id.toString())
          .attach('images', tempPaths[0])
          .field('imageDescriptions[0][description]', '')
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          feedCommentId: feedComment._id.toString(),
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

    it('cannot add more than 4 description on reply', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('imageDescriptions[0][description]', 'this is create feed reply description 0')
        .field('imageDescriptions[1][description]', 'this is create feed reply description 1')
        .field('imageDescriptions[2][description]', 'this is create feed reply description 2')
        .field('imageDescriptions[3][description]', 'this is create feed reply description 3')
        .field('imageDescriptions[4][description]', 'this is create feed reply description 4');
      expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('Only allow maximum of 4 description');
    });

    describe('when the feed post was created by a user with a non-public profile', () => {
      let user1;
      let feedPost1;
      let feedComment1;
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
        feedComment1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user1._id.toString(),
              feedPostId: feedPost1.id,
              message: sampleFeedReplyObject.message,
              images: sampleFeedReplyObject.images,
            },
          ),
        );
      });

      it('should not allow the creation of a feed reply when replying user is not a friend of the post creator', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments/replies')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedCommentId', feedComment1._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1]);
          expect(response.status).toBe(HttpStatus.FORBIDDEN);
          expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
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
        const feedComment2 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user1._id.toString(),
              feedPostId: feedPost2.id,
              message: sampleFeedReplyObject.message,
              images: sampleFeedReplyObject.images,
            },
          ),
        );
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/feed-comments/replies')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedCommentId', feedComment2._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1])
            .field('imageDescriptions[0][description]', 'this is create feed reply description 1')
            .field('imageDescriptions[1][description]', 'this is create feed reply description 2');
          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            feedCommentId: feedComment2._id.toString(),
            feedPostId: feedPost2._id.toString(),
            message: 'hello test user',
            userId: activeUser._id.toString(),
            images: [
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed reply description 1',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                description: 'this is create feed reply description 2',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
      });
    });

    describe('notifications', () => {
      let postCreatorUser;
      let commentCreatorUser;
      let otherUser1;
      let otherUser1AuthToken;
      let otherUser2;
      let otherUser3;
      beforeEach(async () => {
        postCreatorUser = await usersService.create(userFactory.build());
        commentCreatorUser = await usersService.create(userFactory.build());
        otherUser1 = await usersService.create(userFactory.build());
        otherUser1AuthToken = otherUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser2 = await usersService.create(userFactory.build());
        otherUser3 = await usersService.create(userFactory.build());
      });

      it('sends the expected notifications when the reply user IS NOT the post creator user', async () => {
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: commentCreatorUser.id,
              feedPostId: post.id,
              message: 'This is a comment',
              images: [],
            },
          ),
        );
        await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies').auth(otherUser1AuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedCommentId', comment._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(2);

        // TODO: Uncomment and fix lines below

        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: comment._id.toString(),
        //   feedReplyId: response.body._id,
        //   senderId: replyCreatorUser._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'replied to a comment on your post',
        // });
        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: comment._id.toString(),
        //   feedReplyId: response.body._id,
        //   senderId: replyCreatorUser._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'replied to your comment',
        // });
      });

      it('sends the expected notifications when the reply user IS the post creator user', async () => {
        const post = await feedPostsService.create(feedPostFactory.build({ userId: otherUser1._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: commentCreatorUser.id,
              feedPostId: post.id,
              message: 'This is a comment',
              images: [],
            },
          ),
        );
        await request(app.getHttpServer())
          .post('/api/v1/feed-comments/replies').auth(otherUser1AuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedCommentId', comment._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(1);

        // TODO: Uncomment and fix lines below

        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: comment._id.toString(),
        //   feedReplyId: response.body._id,
        //   senderId: replyCreatorUser._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'replied to a comment on your post',
        // });
      });

      it('sends the expected notifications when the reply user is not the post creator user, '
        + 'AND there are three users mentioned in the message and one is the post creator', async () => {
          const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
          const comment = await feedCommentsService.createFeedComment(
            feedCommentsFactory.build(
              {
                userId: commentCreatorUser.id,
                feedPostId: post.id,
                message: 'This is a comment',
                images: [],
              },
            ),
          );
          await request(app.getHttpServer())
            .post('/api/v1/feed-comments/replies').auth(otherUser1AuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('feedCommentId', comment._id.toString())
            .field(
              'message',
              `##LINK_ID##${postCreatorUser._id.toString()}@PostCreatorUser##LINK_END## post creator user`
              + `##LINK_ID##${otherUser2._id.toString()}@OtherUser2##LINK_END## other user 2`
              + `##LINK_ID##${otherUser3._id.toString()}@OtherUser3##LINK_END## other user 3`,
            )
            .expect(HttpStatus.CREATED);

          expect(notificationsService.create).toHaveBeenCalledTimes(4);

          // TODO: Uncomment and fix lines below

          // expect(notificationsService.create).toHaveBeenCalledWith({
          //   userId: postCreatorUser._id.toString(),
          //   feedPostId: post._id.toString(),
          //   feedCommentId: comment._id.toString(),
          //   feedReplyId: response.body._id,
          //   senderId: replyCreatorUser._id.toString(),
          //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          //   notificationMsg: 'replied to a comment on your post',
          // });
          // expect(notificationsService.create).toHaveBeenCalledWith({
          //   userId: postCreatorUser._id.toString(),
          //   feedPostId: post._id.toString(),
          //   feedCommentId: comment._id.toString(),
          //   feedReplyId: response.body._id,
          //   senderId: replyCreatorUser._id.toString(),
          //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          //   notificationMsg: 'replied to your comment',
          // });

          // expect(notificationsService.create).toHaveBeenCalledWith({
          //   userId: otherUser2._id.toString(),
          //   feedPostId: post._id.toString(),
          //   feedCommentId: comment._id.toString(),
          //   feedReplyId: response.body._id,
          //   senderId: replyCreatorUser._id.toString(),
          //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          //   notificationMsg: 'mentioned you in a comment reply',
          // });

          // expect(notificationsService.create).toHaveBeenCalledWith({
          //   userId: otherUser3._id.toString(),
          //   feedPostId: post._id.toString(),
          //   feedCommentId: comment._id.toString(),
          //   feedReplyId: response.body._id,
          //   senderId: replyCreatorUser._id.toString(),
          //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          //   notificationMsg: 'mentioned you in a comment reply',
          // });
        });
    });
  });
});
