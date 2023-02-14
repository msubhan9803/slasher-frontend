/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFiles } from '../../helpers/tempfile-helpers';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { ProfileVisibility } from '../../../src/schemas/user/user.enums';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('POST /feed-comments', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(feedPostFactory.build({ userId: activeUser._id }));
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
    });

    it('returns the expected response upon successful request', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
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
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedPostId', feedPost._id.toString())
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

    it('allows the creation of a comments with only a message, but no files', async () => {
      const message = 'This is a test message';
      const response = await request(app.getHttpServer())
        .post('/feed-comments')
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
        .post('/feed-comments')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '')
        .field('feedPostId', feedPost._id.toString())
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Posts must have a message or at least one image. No message or image received.');
    });

    it('allows the creation of a comments with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1]);

        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: null,
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
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
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .attach('images', tempPaths[4])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Only allow a maximum of 4 images');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
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
          .post('/feed-comments')
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
        .post('/feed-comments')
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
      await blocksModel.create({
        from: activeUser._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .post('/feed-comments')
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

    describe('when the feed post was created by a user with a non-public profile', () => {
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
            .post('/feed-comments')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('feedPostId', feedPost1._id.toString())
            .attach('images', tempPaths[0])
            .attach('images', tempPaths[1]);
          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
          expect(response.body).toEqual({ statusCode: 401, message: 'You must be friends with this user to perform this action.' });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
      });
    });

    describe('notifications', () => {
      let postCreatorUser;
      let postCreatorAuthToken;
      let otherUser1;
      let otherUser1AuthToken;
      let otherUser2;
      let otherUser3;
      beforeEach(async () => {
        postCreatorUser = await usersService.create(userFactory.build());
        postCreatorAuthToken = postCreatorUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser1 = await usersService.create(userFactory.build());
        otherUser1AuthToken = otherUser1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser2 = await usersService.create(userFactory.build());
        otherUser3 = await usersService.create(userFactory.build());
      });

      it('sends the expected notifications when the commenter user is not the post creator user', async () => {
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        await request(app.getHttpServer())
          .post('/feed-comments').auth(otherUser1AuthToken, { type: 'bearer' })
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

      it('does not send any notifications when the commenter user is the post creator user', async () => {
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        await request(app.getHttpServer())
          .post('/feed-comments').auth(postCreatorAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field('message', 'hello test user')
          .expect(HttpStatus.CREATED);

        expect(notificationsService.create).toHaveBeenCalledTimes(0);
        // TODO: Examine notificationsService.create() arguments in greater detail to make sure the right ones went to the right users
      });

      it('sends the expected notifications when the commenter user is not the post creator user, '
        + 'AND there are three users mentioned in the message and one is the post creator', async () => {
          const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
          await request(app.getHttpServer())
            .post('/feed-comments').auth(otherUser1AuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('feedPostId', post._id.toString())
            .field(
              'message',
              `##LINK_ID##${postCreatorUser._id.toString()}@PostCreatorUser##LINK_END## post creator user`
              + `##LINK_ID##${otherUser2._id.toString()}@OtherUser2##LINK_END## other user 2`
              + `##LINK_ID##${otherUser3._id.toString()}@OtherUser3##LINK_END## other user 3`,
            )
            .expect(HttpStatus.CREATED);

          expect(notificationsService.create).toHaveBeenCalledTimes(3);
          // TODO: Examine notificationsService.create() arguments in greater detail to make sure the right ones went to the right users
        });
    });
  });
});
