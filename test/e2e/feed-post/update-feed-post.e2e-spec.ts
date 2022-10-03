import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-post/providers/feed-post.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedPost } from '../../../src/schemas/feedPost/feedPost.schema';

describe('Update Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPost;

  const sampleFeedPostObject = {
    message: 'hello all tet user upload your feed post',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
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
  });

  describe('Update Feed Post Details', () => {
    it('successfully update feed post details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedPostObject);
      const feedPostDetails = await feedPostsService.findById(response.body.id, true);
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.message).toContain(feedPostDetails.message);
    });
  });

  describe('Validation', () => {
    it('check message length validation', async () => {
      sampleFeedPostObject.message = new Array(1002).join('z');
      const response = await request(app.getHttpServer())
        .patch(`/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedPostObject);
        expect(response.body.message).toContain('message cannot be longer than 1000 characters');
    });
  });
});
