/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
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
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../src/schemas/notification/notification.enums';
import { FeedComment } from '../../../src/schemas/feedComment/feedComment.schema';

describe('Feed-Comments/Replies File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let notificationsService: NotificationsService;

  const sampleFeedReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
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

  describe('POST /feed-comments/replies', () => {
    let feedComments;
    let feedComments1;
    let feedPost1;
    let user0;
    let user1;
    let user2;
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

      feedComments = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          user1._id.toString(),
          sampleFeedReplyObject.message,
          sampleFeedReplyObject.images,
        );
      feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      feedComments1 = await feedCommentsService
        .createFeedComment(
          feedPost1.id,
          activeUser._id.toString(),
          sampleFeedReplyObject.message,
          sampleFeedReplyObject.images,
        );
    });

    it('successfully creates notifications when reply was added to their post', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComments._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);

        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          feedCommentId: feedComments._id.toString(),
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
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedPostData.userId as any,
          feedPostId: { _id: feedPostData._id } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id } as unknown as FeedComment,
          feedReplyId: new mongoose.Types.ObjectId(response.body._id),
          senderId: activeUser._id,
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your post',
        });
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedComments.userId.toString(),
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your comment',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('successfully creates notifications when other user is mentioned other user', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`)
          .field('feedCommentId', feedComments._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          feedCommentId: feedComments._id.toString(),
          message: `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`,
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
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedPostData.userId as any,
          feedPostId: { _id: feedPostData._id } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id } as unknown as FeedComment,
          feedReplyId: new mongoose.Types.ObjectId(response.body._id),
          senderId: activeUser._id,
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your post',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedComments.userId.toString(),
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your comment',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user2.id,
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment reply',
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
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`
            + `##LINK_ID##${user0._id.toString()}@Username1##LINK_END## this is cretor of post`
            + `##LINK_ID##${user1._id.toString()}@Username1##LINK_END## this cretor of comment`)
          .field('feedCommentId', feedComments1._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost1._id.toString(),
          feedCommentId: feedComments1._id.toString(),
          message: `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`
            + `##LINK_ID##${user0._id.toString()}@Username1##LINK_END## this is cretor of post`
            + `##LINK_ID##${user1._id.toString()}@Username1##LINK_END## this cretor of comment`,
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
        const feedPostData = await feedPostsService.findById(feedPost1.id, false);

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user0.id,
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments1._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment reply',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user1.id,
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments1._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment reply',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user2.id,
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments1._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment reply',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('successfully creates notifications when other user is mentioned own', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`)
          .field('feedCommentId', feedComments._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          feedCommentId: feedComments._id.toString(),
          message: `##LINK_ID##${user2._id.toString()}@Username1##LINK_END## test user`,
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
        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedPostData.userId as any,
          feedPostId: { _id: feedPostData._id } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id } as unknown as FeedComment,
          feedReplyId: new mongoose.Types.ObjectId(response.body._id),
          senderId: activeUser._id,
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your post',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: feedComments.userId.toString(),
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'replied on your comment',
        });

        expect(notificationsService.create).toHaveBeenCalledWith({
          userId: user2.id,
          feedPostId: { _id: feedPostData._id.toString() } as unknown as FeedPost,
          feedCommentId: { _id: feedComments._id.toString() } as unknown as FeedComment,
          feedReplyId: response.body._id.toString(),
          senderId: activeUser._id.toString(),
          notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
          notificationMsg: 'mentioned you in a comment reply',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response when one or more uploads files user an unallowed extension', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComments._id.toString())
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
        .post('/feed-comments/replies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message)
        .field('userId', activeUser._id.toString())
        .field('feedCommentId', feedComments._id.toString())
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedCommentId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'This is a test message',
        userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        images: [],
      });
    });

    it('allows the creation of a reply with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedCommentId', feedComments._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1]);
        expect(response.body.message).toContain('message should not be empty');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('only allows a maximum of four images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComments._id.toString())
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
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedCommentId', feedComments._id.toString())
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
          .post('/feed-comments/replies')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', new Array(8002).join('z'))
          .field('feedCommentId', feedComments._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });
  });
});
