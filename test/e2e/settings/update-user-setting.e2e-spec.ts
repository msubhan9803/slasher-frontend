import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { userSettingFactory } from '../../factories/user-setting.factory';
import { UserSettingsService } from '../../../src/settings/providers/user-settings.service';

describe('settings update / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let userSettingsService: UserSettingsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;

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
    connection = await moduleRef.get<Connection>(getConnectionToken());

    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    usersService = moduleRef.get<UsersService>(UsersService);
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
    await userSettingsService.create(userSettingFactory.build({
      userId: activeUser._id,
    }));
  });

  describe('PATCH /settings/notifications', () => {
    describe('Successful update', () => {
      it('update the user setting data successful and it returns the expected response', async () => {
        await request(app.getHttpServer())
          .patch('/settings/notifications')
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
      });
    });
  });
});
