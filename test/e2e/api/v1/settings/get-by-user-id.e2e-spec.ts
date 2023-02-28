import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('GET settings (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let userSettingsService: UserSettingsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('GET /api/v1/settings/notifications', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/settings/notifications').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Find a user setting by id', () => {
      it('returns the expected user', async () => {
        await userSettingsService.create(
          userSettingFactory.build({
            userId: activeUser.id,
          }),
        );
        const response = await request(app.getHttpServer())
          .get('/api/v1/settings/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          app_tutorial: 1,
          dating_got_a_match: 1,
          dating_message_received: 1,
          event_reminder: 1,
          event_suggested: 1,
          feed_comment_on_post: 1,
          feed_mention_on_post_comment_reply: 1,
          feed_post_like: 1,
          friends_got_a_match: 0,
          friends_message_received: 1,
          message_board_like_your_post: 1,
          message_board_mention_on_comment_reply: 1,
          message_board_new_post_on_thread: 1,
          message_board_reply_your_post: 1,
          movie_comment_on_reply: 1,
          movie_comment_reply_like: 1,
          movie_mention_on_comment_reply: 1,
          onboarding_completed: true,
          rss_feed_mention_on_post_comment_reply: 1,
          rss_feed_post_like: 1,
        });
        expect(await userSettingsService.findByUserId(activeUser.id)).toBeTruthy();
      });

      it('returns the expected response when the user setting is not found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/settings/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User setting not found',
          statusCode: 404,
        });
      });
    });
  });
});
