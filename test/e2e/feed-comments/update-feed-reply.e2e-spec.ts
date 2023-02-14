import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { feedCommentsFactory } from '../../factories/feed-comments.factory';
import { feedRepliesFactory } from '../../factories/feed-reply.factory';

describe('Feed-Comments/Replies Update File (e2e)', () => {
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
    message: 'hello all test user upload your feed reply',
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('PATCH /feed-comments/replies/:feedCommentId', () => {
    let feedComments;
    let feedReply;
    beforeEach(async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

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
      feedComments = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
      feedReply = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments.id,
            message: 'Hello Reply Test Message 1',
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
    });

    it('successfully update feed reply messages', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/replies/${feedReply._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello all test user upload your feed reply',
        images: [
          {
            image_path: 'https://picsum.photos/id/237/200/300',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
        feedCommentId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
      });
    });

    describe('notifications', () => {
      let postCreatorUser;
      let commentCreatorUser;
      let commentCreatorUserAuthToken;
      let otherUser1;
      let otherUser2;
      let otherUser3;
      beforeEach(async () => {
        postCreatorUser = await usersService.create(userFactory.build());
        commentCreatorUser = await usersService.create(userFactory.build());
        commentCreatorUserAuthToken = commentCreatorUser.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        otherUser1 = await usersService.create(userFactory.build());
        otherUser2 = await usersService.create(userFactory.build());
        otherUser3 = await usersService.create(userFactory.build());
      });

      it('sends notifications to newly-added users in the message, but ignores the comment creator', async () => {
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: otherUser1._id,
              feedPostId: post.id,
              message: 'This is a comment',
              images: [],
            },
          ),
        );
        const reply = await feedCommentsService.createFeedReply(
            feedRepliesFactory.build(
              {
                userId: commentCreatorUser._id,
                feedCommentId: comment.id,
                message: `Hello ##LINK_ID##${otherUser1._id.toString()}@OtherUser2##LINK_END## other user 1`,
                images: [],
              },
            ),
          );
        await request(app.getHttpServer())
          .patch(`/feed-comments/replies/${reply._id}`)
          .auth(commentCreatorUserAuthToken, { type: 'bearer' })
          .send({
            message: `##LINK_ID##${otherUser1._id.toString()}@OtherUser2##LINK_END## other user 1` // do not notify
              + `##LINK_ID##${postCreatorUser._id.toString()}@PostCreatorUser##LINK_END## post creator user` // do not notify
              + `##LINK_ID##${commentCreatorUser._id.toString()}@PostCreatorUser##LINK_END## comment creator user` // notify
              + `##LINK_ID##${otherUser2._id.toString()}@OtherUser3##LINK_END## other user 2` // notify
              + `##LINK_ID##${otherUser3._id.toString()}@OtherUser3##LINK_END## other user 3`, // notify
          })
          .expect(HttpStatus.OK);

        expect(notificationsService.create).toHaveBeenCalledTimes(3);

        // TODO: Uncomment and fix lines below

        // expect(notificationsService.create).toHaveBeenCalledWith({
        //   userId: postCreatorUser._id.toString(),
        //   feedPostId: post._id.toString(),
        //   feedCommentId: comment._id.toString(),
        //   feedReplyId: response.body._id,
        //   senderId: otherUser1._id.toString(),
        //   notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        //   notificationMsg: 'mentioned you in a reply',
        // });
      });
    });

    it('when feed reply id is not exists than expected response', async () => {
      const feedReply1 = '6386f95401218469e30dbd25';
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/replies/${feedReply1}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('Not found.');
    });

    it('when feed reply id and login user id is not match than expected response', async () => {
      const feedReply1 = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: user0._id,
              feedCommentId: feedComments.id,
              message: 'Hello Reply Test Message 2',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );

      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/replies/${feedReply1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject);
      expect(response.body.message).toContain('Permission denied.');
    });

    describe('Validation', () => {
      it('check message length validation', async () => {
        sampleFeedCommentsObject.message = new Array(8_002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/feed-comments/replies/${feedReply._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFeedCommentsObject);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      });

      it('message should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/feed-comments/replies/${feedReply._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('message should not be empty');
      });
    });
  });
});
