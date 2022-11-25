import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedReply, FeedReplyDocument } from '../../../src/schemas/feedReply/feedReply.schema';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';

describe('Feed-Comments/Replies Update File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let feedReplyModel: Model<FeedReplyDocument>;

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
    feedReplyModel = moduleRef.get<Model<FeedReplyDocument>>(getModelToken(FeedReply.name));
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
      activeUser = await usersService.create(userFactory.build());
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
      feedComments = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      feedReply = await feedCommentsService
        .createFeedReply(
          feedComments.id,
          activeUser._id.toString(),
          'Hello Reply Test Message 1',
          sampleFeedCommentsObject.images,
        );
    });

    it('successfully update feed reply messages', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/replies/${feedReply._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject);
      const feedCommentsDetails = await feedReplyModel.findById(response.body._id);
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.message).toContain(feedCommentsDetails.message);
    });

    describe('Validation', () => {
      it('check message length validation', async () => {
        sampleFeedCommentsObject.message = new Array(1002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/feed-comments/replies/${feedReply._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFeedCommentsObject);
        expect(response.body.message).toContain('message cannot be longer than 1000 characters');
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
