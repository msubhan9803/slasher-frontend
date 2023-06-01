/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { readdirSync } from 'fs';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';

describe('Feed-Comments / Comments Update (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let notificationsService: NotificationsService;

  const sampleFeedCommentsObject = {
    message: 'hello all test user upload your feed comments',
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this update feed comment description 1',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this update feed comment description 2',
      },
    ],
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

  describe('PATCH /api/v1/feed-comments/:feedCommentId', () => {
    let feedComment;
    beforeEach(async () => {
      // jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );

      feedComment = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
    });

    it('requires authentication', async () => {
      const feedCommentId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/feed-comments/${feedCommentId}`).expect(HttpStatus.UNAUTHORIZED);
    });
    describe('with mocked notificationsService.create', () => {
      beforeEach(async () => {
        jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      });
      it('successfully update feed comments messages', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', sampleFeedCommentsObject.message);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello all test user upload your feed comments',
          userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          images: [
            {
              image_path: 'https://picsum.photos/id/237/200/300',
              description: 'this update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
              description: 'this update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });
      });

      it('when feed comment id is not exists than expected response', async () => {
        const feedComments1 = '6386f95401218469e30dbd25';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComments1}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', sampleFeedCommentsObject.message)
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.message).toContain('Not found.');
      });

      it('when feed comment id and login user id is not match than expected response', async () => {
        const feedComments1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user0._id,
              feedPostId: feedPost.id,
              message: sampleFeedCommentsObject.message,
              images: sampleFeedCommentsObject.images,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComments1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', sampleFeedCommentsObject.message);

        expect(response.body.message).toContain('Permission denied.');
      });

      it('when imagesToDelete is exist than check files length, return the expected response', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/feed-comments/${feedComment._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', 'hello test user')
            .field('imagesToDelete', (feedComment.images[0] as any).id)
            .attach('files', tempPaths[0])
            .attach('files', tempPaths[1])
            .attach('files', tempPaths[2])
            .attach('files', tempPaths[3]);
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Cannot include more than 4 images on a comment.',
          });
        }, [
          { extension: 'png' }, { extension: 'png' }, { extension: 'png' },
          { extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' },
        ]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('only allows a maximum of 4 images', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/feed-comments/${feedComment._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('message', sampleFeedCommentsObject.message)
            .attach('files', tempPaths[0])
            .attach('files', tempPaths[1])
            .attach('files', tempPaths[2])
            .attach('files', tempPaths[3])
            .attach('files', tempPaths[4]);
          expect(response.body.message).toBe('Too many files uploaded. Maximum allowed: 4');
        }, [
          { extension: 'png' }, { extension: 'png' },
          { extension: 'png' }, { extension: 'png' },
          { extension: 'jpg' }, { extension: 'png' },
        ]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('responds expected response when neither message nor file are present in request'
        + 'and db images length or body imagesToDelete length is same', async () => {
          const feedComment0 = await feedCommentsService.createFeedComment(
            feedCommentsFactory.build(
              {
                userId: activeUser._id,
                feedPostId: feedPost.id,
                message: sampleFeedCommentsObject.message,
                images: [{
                  image_path: '/feed/feed_sample1.jpg',
                  description: 'this is update feed comment description 1',
                }],
              },
            ),
          );
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/feed-comments/${feedComment0._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .field('message', '')
            .field('imagesToDelete', (feedComment0.images[0] as any).id)
            .expect(HttpStatus.BAD_REQUEST);
          expect(response.body.message).toBe('Comments must have some text or at least one image.');
        });

      it('when comment has a already 4 images and add more 2 images than expected response', async () => {
        const feedComment1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser._id,
              feedPostId: feedPost.id,
              message: sampleFeedCommentsObject.message,
              images: [
                {
                  image_path: '/feed/feed_sample1.jpg',
                  description: 'this is update feed comment description 1',
                },
                {
                  image_path: '/feed/feed_sample2.jpg',
                  description: 'this is update feed comment description 2',
                },
                {
                  image_path: '/feed/feed_sample3.jpg',
                  description: 'this is update feed comment description 3',
                },
                {
                  image_path: '/feed/feed_sample4.jpg',
                  description: 'this is update feed comment description 4',
                },
              ],
            },
          ),
        );
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/feed-comments/${feedComment1._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPaths[0])
            .attach('files', tempPaths[1]);
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Cannot include more than 4 images on a comment.',
          });
        }, [
          { extension: 'png' }, { extension: 'png' },
          { extension: 'png' }, { extension: 'png' },
          { extension: 'png' }, { extension: 'png' },
        ]);
        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('check message has a empty string or files or imagesToDelete is not exists', async () => {
        const feedComment2 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser._id,
              feedPostId: feedPost.id,
              message: sampleFeedCommentsObject.message,
              images: [],
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment2._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', '');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'Comments must have some text or at least one image.',
        });
      });

      it('check trim is working for message in update feed comments', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', '       hello test user comment');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: feedPost._id.toString(),
          message: 'hello test user comment',
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: 'https://picsum.photos/id/237/200/300',
              description: 'this update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
              description: 'this update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });
      });

      it('returns the expected response when the message only contains whitespace characters', async () => {
        const feedComment3 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser._id,
              feedPostId: feedPost.id,
              message: sampleFeedCommentsObject.message,
              images: [],
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment3._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', '          \n\n');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'Comments must have some text or at least one image.',
        });
      });

      it('sends notifications to newly-added users in the message', async () => {
        const postCreatorUser = await usersService.create(userFactory.build());
        const commentCreatorUser = await usersService.create(userFactory.build());
        const commentCreatorUserAuthToken = commentCreatorUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        const otherUser1 = await usersService.create(userFactory.build());
        const otherUser2 = await usersService.create(userFactory.build());
        const otherUser3 = await usersService.create(userFactory.build());
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: commentCreatorUser.id,
              feedPostId: post.id,
              message: `Hello ##LINK_ID##${otherUser1._id.toString()}@OtherUser2##LINK_END## other user 1`,
              images: [],
            },
          ),
        );
        await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${comment._id}`)
          .auth(commentCreatorUserAuthToken, { type: 'bearer' })
          .field('message', `##LINK_ID##${otherUser1._id.toString()}@OtherUser2##LINK_END## other user 1` // do not notify
            + `##LINK_ID##${postCreatorUser._id.toString()}@PostCreatorUser##LINK_END## post creator user` // do not notify
            + `##LINK_ID##${commentCreatorUser._id.toString()}@PostCreatorUser##LINK_END## comment creator user` // notify
            + `##LINK_ID##${otherUser2._id.toString()}@OtherUser3##LINK_END## other user 2` // notify
            + `##LINK_ID##${otherUser3._id.toString()}@OtherUser3##LINK_END## other user 3`)
          .expect(HttpStatus.OK);

        expect(notificationsService.create).toHaveBeenCalledTimes(3);

        // TODO: Uncomment and fix lines below

        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: response.body._id,
        //   senderId: otherUser1._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'mentioned you in a comment',
        // });
      });
    });

    it('when imagesToDelete and files is exist than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('imagesToDelete', (feedComment.images[0] as any).id)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update feed comment description 1')
          .field('imageDescriptions[1][description]', 'this is update feed comment description 2');
        const feedCommentData = await feedCommentsService.findFeedComment(response.body._id);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          feedPostId: feedPost.id,
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
              description: 'this update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });
        expect(feedCommentData.images).toHaveLength(3);
      }, [{ extension: 'png' }, { extension: 'png' }]);
      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imagesToDelete not exist and files is exist than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update feed comment description 1')
          .field('imageDescriptions[1][description]', 'this is update feed comment description 2');
        const feedCommentData = await feedCommentsService.findFeedComment(response.body._id);

        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          feedPostId: feedPost.id,
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/id/237/200/300',
              description: 'this update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
              description: 'this update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });
        expect(feedCommentData.images).toHaveLength(4);
      }, [{ extension: 'png' }, { extension: 'png' }]);
      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imagesToDelete exist and files is not exist than expected response', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-comments/${feedComment._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('imagesToDelete', (feedComment.images[0] as any).id)
        .field('message', 'hello test user');
      const feedCommentData = await feedCommentsService.findFeedComment(response.body._id);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello test user',
        feedPostId: feedPost.id,
        userId: activeUser._id.toString(),
        images: [
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            description: 'this update feed comment description 2',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
      });
      expect(feedCommentData.images).toHaveLength(1);
    });
    describe('notifications', () => {
      let commentCreatorUser;
      let commentCreatorUserAuthToken;
      let otherUser1;
      let otherUser2;
      beforeEach(async () => {
        commentCreatorUser = await usersService.create(userFactory.build());
        commentCreatorUserAuthToken = commentCreatorUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser1 = await usersService.create(userFactory.build());
        otherUser2 = await usersService.create(userFactory.build());
      });

      it('when notification is create for updateFeedComments than check newNotificationCount is increment in user', async () => {
        const user4 = await usersService.create(userFactory.build({ userName: 'Divine' }));
        const post = await feedPostsService.create(feedPostFactory.build({ userId: user0._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: commentCreatorUser.id,
              feedPostId: post.id,
              message: `Hello ##LINK_ID##${otherUser1._id.toString()}@OtherUser1##LINK_END## other user 1`,
              images: [],
            },
          ),
        );

        await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${comment._id}`)
          .auth(commentCreatorUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('feedPostId', post._id.toString())
          .field(
            'message',
            `##LINK_ID##${user4._id.toString()}@Divine##LINK_END## post creator user`
            + `##LINK_ID##${otherUser2._id.toString()}@OtherUser2##LINK_END## other user 2`,
          )
          .expect(HttpStatus.OK);

        const user4NewNotificationCount = await usersService.findById(user4.id, true);
        const otherUser2NewNotificationCount = await usersService.findById(otherUser2.id, true);

        expect(user4NewNotificationCount.newNotificationCount).toBe(1);
        expect(otherUser2NewNotificationCount.newNotificationCount).toBe(1);
      });
    });

    it('when files length is not equal imageDescriptions length than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('feedPostId', feedPost._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is create feed comments description 2');
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
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', sampleFeedCommentsObject.message)
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', '');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello all test user upload your feed comments',
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: null,
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/id/237/200/300',
              description: 'this update feed comment description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
              description: 'this update feed comment description 2',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
          userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        });
      }, [{ extension: 'png' }]);
    });

    it('cannot add more than 4 description on comments', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-comments/${feedComment._id}`)
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
        .patch(`/api/v1/feed-comments/${feedComment._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('imageDescriptions[0][description]', new Array(252).join('z'))
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain('description cannot be longer than 250 characters');
    });

    describe('Validation', () => {
      it('check message length validation', async () => {
        const message = new Array(8002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-comments/${feedComment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', message);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      });
    });
  });
});
