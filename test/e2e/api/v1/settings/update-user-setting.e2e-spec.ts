import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { userSettingFactory } from '../../../../factories/user-setting.factory';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('settings update / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let userSettingsService: UserSettingsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  const sampleUserSettingUpdateObject = {
    friends_got_a_match: 0,
    friends_message_received: 1,
    message_board_like_your_post: 1,
    message_board_reply_your_post: 0,
    message_board_new_post_on_thread: 1,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    usersService = moduleRef.get<UsersService>(UsersService);
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    await userSettingsService.create(userSettingFactory.build({
      userId: activeUser._id,
    }));
  });

  describe('PATCH /api/v1/settings/notifications', () => {
    describe('Successful update', () => {
      it('update the user setting data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/v1/settings/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleUserSettingUpdateObject);
        await userSettingsService.update(activeUser._id.toString(), sampleUserSettingUpdateObject);
        const reloadedUserSetting = await userSettingsService.findByUserId(activeUser._id.toString());
        expect(reloadedUserSetting.friends_got_a_match).toEqual(sampleUserSettingUpdateObject.friends_got_a_match);
        expect(reloadedUserSetting.friends_message_received).toEqual(sampleUserSettingUpdateObject.friends_message_received);
        expect(reloadedUserSetting.message_board_like_your_post).toEqual(sampleUserSettingUpdateObject.message_board_like_your_post);
        expect(reloadedUserSetting.message_board_reply_your_post).toEqual(sampleUserSettingUpdateObject.message_board_reply_your_post);
        expect(reloadedUserSetting.message_board_new_post_on_thread).toEqual(
          sampleUserSettingUpdateObject.message_board_new_post_on_thread,
        );
        expect(response.body).toEqual(
          {
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
            message_board_reply_your_post: 0,
            movie_comment_on_reply: 1,
            movie_comment_reply_like: 1,
            movie_mention_on_comment_reply: 1,
            onboarding_completed: true,
            rss_feed_mention_on_post_comment_reply: 1,
            rss_feed_post_like: 1,
          },
        );
      });
    });
  });
});
