import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { userFactory } from '../../../../factories/user.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';

describe('Hashtag Onboarding Suggestions (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let hashtagModel: Model<HashtagDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));

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

    activeUser = await usersService.create(userFactory.build(
      { userName: 'test-user1' },
    ));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    const names = [
      'horror1', 'horror2', 'horror3', 'horror4', 'horror5',
      'horror6', 'horror7', 'horror8', 'horror9', 'horror10',
      'horror11', 'horror12', 'horror13', 'horror14', 'horror15',
      'horror16', 'horror17', 'horror18', 'horror19', 'horror20',
    ];
    for (let i = 0; i < names.length; i += 1) {
      await hashtagModel.create({
        name: names[i],
      });
    }

    await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
        message: 'slasher post#horror1 #horror2 #horror3 #horror4 #horror5 #horror6',
        createdAt: DateTime.now().minus({ days: 5 }).toJSDate(),
        updatedAt: DateTime.now().minus({ days: 5 }).toJSDate(),
        lastUpdateAt: DateTime.now().minus({ days: 5 }).toJSDate(),
        hashtags: [
          'horror1', 'horror2', 'horror3',
          'horror4', 'horror5', 'horror6',
        ],
      }),
    );
  });

  describe('GET /api/v1/hashtags/onboarding-suggestions', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/hashtags/onboarding-suggestions').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Get all suggest hashtag name', () => {
      it('when hashtags plus hashtags24Hours not get 16 hashtags than finds db hashtags', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/hashtags/onboarding-suggestions')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          'horror1', 'horror2',
          'horror3', 'horror4',
          'horror5', 'horror6',
          'horror7', 'horror8',
          'horror9', 'horror10',
          'horror11', 'horror12',
          'horror13', 'horror14',
          'horror15', 'horror16',
        ]);
      });

      it('when hashtags has a common(fouteenDaysAgo + oneDayAgo = 14) and add 2 removedItems hashtags than expected response', async () => {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
            message: 'post #horror7 #horror8 #horror9'
              + '#horror10 #horror11 #horror12 #horror13 #horror14 #horror15 #horror16'
              + '#horror17 #horror18 #horror19 #horror20',
            createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            updatedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            lastUpdateAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            hashtags: [
              'horror7', 'horror8', 'horror9', 'horror10',
              'horror11', 'horror12', 'horror13', 'horror14', 'horror15',
              'horror16', 'horror17', 'horror18', 'horror19', 'horror20',
            ],
          }),
        );
        const response = await request(app.getHttpServer())
          .get('/api/v1/hashtags/onboarding-suggestions')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          'horror7', 'horror8',
          'horror9', 'horror10',
          'horror11', 'horror12',
          'horror13', 'horror14',
          'horror15', 'horror16',
          'horror17', 'horror18',
          'horror19', 'horror20',
          'horror1', 'horror2',
        ]);
      });

      it('when hashtags has a common(fouteenDaysAgo + oneDayAgo = 16) hashtags than expected response', async () => {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
            message: 'post #horror7 #horror8 #horror9'
              + '#horror10 #horror11 #horror12 #horror13 #horror14 #horror15 #horror16'
              + '#horror17 #horror18 #horror19 #horror20 #horror21 #horror22',
            createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            updatedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            lastUpdateAt: DateTime.now().minus({ days: 1 }).toJSDate(),
            hashtags: [
              'horror7', 'horror8', 'horror9', 'horror10',
              'horror11', 'horror12', 'horror13', 'horror14',
              'horror15', 'horror16', 'horror17', 'horror18',
              'horror19', 'horror20', 'horror21', 'horror22',
            ],
          }),
        );
        const response = await request(app.getHttpServer())
          .get('/api/v1/hashtags/onboarding-suggestions')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          'horror7', 'horror8',
          'horror9', 'horror10',
          'horror11', 'horror12',
          'horror13', 'horror14',
          'horror15', 'horror16',
          'horror17', 'horror18',
          'horror19', 'horror20',
          'horror21', 'horror22',
        ]);
      });
    });
  });
});
