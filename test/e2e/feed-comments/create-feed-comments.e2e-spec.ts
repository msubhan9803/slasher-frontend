/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFiles } from '../../helpers/tempfile-helpers';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPost, FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../src/schemas/notification/notification.enums';
import { FeedComment } from '../../../src/schemas/feedComment/feedComment.schema';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
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
    let user0;
    let user1;
    let user2;
    let feedPost1;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      user2 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user0._id,
          },
        ),
      );
      feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
    });

    it('successfully creates notifications when commenter is not post creator', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

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
        const feedPostData = await feedPostsService.findById(feedPost.id, false);

        const feedPostDataObject = (feedPostData as any).toObject();
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: {
            _id: feedPostDataObject.userId._id.toString(),
            profilePic: feedPostDataObject.userId.profilePic,
            userName: feedPostDataObject.userId.userName,
          },
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: response.body._id } as unknown as FeedComment,
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserCommentedOnYourPost,
          notificationMsg: 'commented on your post',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('successfully creates notifications when commenter is post creator', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedPostId', feedPost1._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost1._id.toString(),
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

    it('successfully creates notifications for mentioned user ids', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', `##LINK_ID##${activeUser._id.toString()}@Username1##LINK_END## this is comment cretor`
          + `##LINK_ID##${user1._id.toString()}@Username3##LINK_END## other user 1`
          + `##LINK_ID##${user2._id.toString()}@Username4##LINK_END## other user 2`)
          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: `##LINK_ID##${activeUser._id.toString()}@Username1##LINK_END## this is comment cretor`
          + `##LINK_ID##${user1._id.toString()}@Username3##LINK_END## other user 1`
          + `##LINK_ID##${user2._id.toString()}@Username4##LINK_END## other user 2`,
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

        expect(notificationsService.create).toHaveBeenCalledTimes(3);

        const feedPostData = await feedPostsService.findById(feedPost.id, false);

        const feedPostDataObject = (feedPostData as any).toObject();
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: {
            _id: feedPostDataObject.userId._id.toString(),
            profilePic: feedPostDataObject.userId.profilePic,
            userName: feedPostDataObject.userId.userName,
          },
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: response.body._id } as unknown as FeedComment,
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserCommentedOnYourPost,
          notificationMsg: 'commented on your post',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user1._id.toString(),
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: response.body._id.toString() } as unknown as FeedComment,
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user2._id.toString(),
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: response.body._id.toString() } as unknown as FeedComment,
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment',
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
        feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'This is a test message',
        userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        images: [],
      });
    });

    it('allows the creation of a comments with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message should not be empty');
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
  });
});
