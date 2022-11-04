import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSetting, UserSettingSchema } from '../schemas/userSetting/userSetting.schema';
import { SettingsController } from './settings.controller';
import { UserSettingsService } from './providers/user-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSetting.name, schema: UserSettingSchema }]),
  ],
  controllers: [SettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingModule { }
