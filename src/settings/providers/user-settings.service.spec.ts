import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { UserSettingsService } from './user-settings.service';
import { userSettingFactory } from '../../../test/factories/user-setting.factory';
import { userFactory } from '../../../test/factories/user.factory';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { UserSettingDocument } from '../../schemas/userSetting/userSetting.schema';
import { dropCollections } from '../../../test/helpers/mongo-helpers';

describe('UserSettingsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let userSettingsService: UserSettingsService;
  let usersService: UsersService;
  let userData: UserDocument;
  let userSetting: UserSettingDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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
    await dropCollections(connection);
    userData = await usersService.create(userFactory.build());
    userSetting = await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: userData._id,
        },
      ),
    );
  });

  describe('#create', () => {
    it('successfully creates a user setting', async () => {
      const userSettingData = userSettingFactory.build(
        {
          userId: userData._id,
        },
      );
      expect(await userSettingsService.create(userSettingData)).toBeTruthy();
    });
  });

  describe('#findByUserId', () => {
    it('successfully get a user setting', async () => {
      const getUserSetting = await userSettingsService.findByUserId(userData._id);
      expect(getUserSetting._id).toEqual(userSetting._id);
      expect(getUserSetting.userId).toEqual(userSetting.userId);
      expect(getUserSetting.message_board_new_post_on_thread).toEqual(userSetting.message_board_new_post_on_thread);
    });
  });

  describe('#update', () => {
    it('finds the expected setting and update the details', async () => {
      const userSettingData = userSettingFactory.build(
        {
          userId: userData._id,
        },
      );
      await userSettingsService.create(userSettingData);
      const settingData = {
        friends_got_a_match: 0,
        friends_message_received: 1,
        message_board_like_your_post: 1,
        message_board_reply_your_post: 0,
        message_board_new_post_on_thread: 0,
      };

      await userSettingsService.update(userData._id.toString(), settingData);
      const reloadedUserSetting = await userSettingsService.findByUserId(userData._id);
      expect(reloadedUserSetting.friends_got_a_match).toEqual(settingData.friends_got_a_match);
      expect(reloadedUserSetting.friends_message_received).toEqual(settingData.friends_message_received);
      expect(reloadedUserSetting.message_board_like_your_post).toEqual(settingData.message_board_like_your_post);
      expect(reloadedUserSetting.message_board_reply_your_post).toEqual(settingData.message_board_reply_your_post);
      expect(reloadedUserSetting.message_board_new_post_on_thread).toEqual(settingData.message_board_new_post_on_thread);
    });
  });
});
