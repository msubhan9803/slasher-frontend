import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { MailService } from '../providers/mail.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { User, UserSchema } from '../schemas/user/user.schema';
import { FriendsModule } from '../friends/friends.module';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { UserSettingModule } from '../settings/user-settings.module';
import { SocketUser, SocketUserSchema } from '../schemas/socketUser/socketUser.schema';
import { ChatModule } from '../chat/chat.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: SocketUser.name, schema: SocketUserSchema }]),
    FeedPostsModule,
    NotificationsModule,
    FriendsModule,
    UserSettingModule,
    ChatModule,
    BlocksModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, LocalStorageService, S3StorageService],
  exports: [UsersService],
})
export class UsersModule { }
