import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedPost } from '../../../src/schemas/feedPost/feedPost.schema';

describe('All Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPost;

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

  describe('All Feed Post Details', () => {
    it('when limit is exist but earlier than post id is not exist than expected feed post response', async () => {
      for (let i = 0; i < 7; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
      }
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/users/${activeUser._id}/posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(3);
    });

    it('when earlier than post id does exists than expected feed post response', async () => {
      for (let i = 0; i < 7; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
      }
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/users/${activeUser._id}/posts?limit=${limit}&earlierThanPostId=${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(3);
    });
  });
});
