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

describe('Feed-Reply / Reply Delete File (e2e)', () => {
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

  describe('DELETE /feed-comments/replies/:feedReplyId', () => {
    let feedComments;
    let feedReply;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
          },
        ),
      );
      feedComments = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser.id,
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      feedReply = await feedCommentsService
        .createFeedReply(
          feedComments.id,
          activeUser.id,
          'Hello Reply Test Message 1',
          sampleFeedCommentsObject.images,
        );
    });

    it('successfully delete feed reply', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/feed-comments/replies/${feedReply._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
    });

    it('when feed reply id is not exists than expected response', async () => {
      const feedReply1 = '6386f95401218469e30dbd25';
      const response = await request(app.getHttpServer())
        .delete(`/feed-comments/replies/${feedReply1}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('Not found.');
    });

    it('when feed reply id and login user id is not match than expected response', async () => {
      const feedReply1 = await feedCommentsService
        .createFeedReply(
          feedComments.id,
          user0._id.toString(),
          'Hello Reply Test Message 2',
          sampleFeedCommentsObject.images,
        );
      const response = await request(app.getHttpServer())
        .delete(`/feed-comments/replies/${feedReply1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body.message).toContain('Permission denied.');
    });
  });
});
