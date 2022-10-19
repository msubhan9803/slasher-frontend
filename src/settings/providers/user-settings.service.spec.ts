import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../app.module';
import { UserSettingsService } from './user-settings.service';
import { userSettingFactory } from '../../../test/factories/user-settings';
import { userFactory } from '../../../test/factories/user.factory';
import { UserDocument } from '../../schemas/user/user.schema';
import { UserSettingDocument } from '../../schemas/userSetting/userSetting.schema';
import { UsersService } from '../../users/providers/users.service';

describe('UserSettingsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let userSettingsService: UserSettingsService;
  let setting: UserSettingDocument;
  let usersService: UsersService;
  let userData: Partial<UserDocument>;

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
    userData = await usersService.create(userFactory.build());
    setting = await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: userData._id
        }
      ),
    );
  });

  describe('#create', () => {
    it('successfully creates a event', async () => {  
      const userSettingData = userSettingFactory.build(
        {
          userId: userData._id
        },
      );
      const saveSetting = await userSettingsService.create(userSettingData);
      expect(await userSettingsService.findByUserId(saveSetting._id));;
    });
  });

  describe('#getsetting', () => {
    it('successfully get a user setting----------------', async () => {
      expect(await userSettingsService.findByUserId(userData._id)).toBeTruthy();;
    });
  });

 

  describe('#update', () => {
    it('finds the expected setting and update the details', async () => {
      const userSettingData = userSettingFactory.build(
        {
          userId: userData._id
        },
      );
      const saveSetting = await userSettingsService.create(userSettingData);
      const settingData = {
        friends_got_a_match: 0,
        friends_message_received: 1,
        message_board_like_your_post: 1,
        message_board_reply_your_post:0,
        message_board_new_post_on_thread: 0
      };
      
      const updatedSetting = await userSettingsService.update(userData._id.toString(), settingData);
      const reloadedEvent = await userSettingsService.findUserSetting({userId:userData._id});;
      expect(reloadedEvent.friends_got_a_match).toEqual(settingData.friends_got_a_match)
      expect(reloadedEvent.friends_message_received).toEqual(settingData.friends_message_received);
      expect(reloadedEvent.message_board_like_your_post).toEqual(settingData.message_board_like_your_post);
      expect(reloadedEvent.message_board_reply_your_post).toEqual(settingData.message_board_reply_your_post);
      expect(reloadedEvent.message_board_new_post_on_thread).toEqual(settingData.message_board_new_post_on_thread);
    });
  });

});
