import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaptchaModule } from '../captcha/captcha.module';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { User, UserSchema } from '../schemas/user/user.schema';
import { UserSettingModule } from '../settings/user-settings.module';
import { SocketUser, SocketUserSchema } from '../schemas/socketUser/socketUser.schema';
import { ChatModule } from '../chat/chat.module';
import { RssFeedProviderFollowsModule } from '../rss-feed-provider-follows/rss-feed-provider-follows.module';
import { RssFeedProvidersModule } from '../rss-feed-providers/rss-feed-providers.module';
import { MailModule } from '../providers/mail.module';
import { DisallowedUsernameModule } from '../disallowedUsername/disallowed-username.module';
import { UsersEmailChangeController } from './users.email-change.controller';
import { UsersPublicController } from './users.public.controller';
import { EmailRevertTokensModule } from '../email-revert-tokens/email-revert-tokens.module';

// Since the UsersModule is likely to be used in many places, we'll make it global
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: SocketUser.name, schema: SocketUserSchema }]),
    UserSettingModule,
    EmailRevertTokensModule,
    ChatModule,
    RssFeedProviderFollowsModule,
    RssFeedProvidersModule,
    MailModule,
    DisallowedUsernameModule,
    CaptchaModule,
  ],
  controllers: [UsersEmailChangeController, UsersPublicController, UsersController],
  providers: [UsersService, LocalStorageService, S3StorageService],
  exports: [UsersService],
})
export class UsersModule { }
