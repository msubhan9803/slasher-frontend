import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { MailService } from '../providers/mail.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { User, UserSchema } from '../schemas/user/user.schema';
import { FeedPostsService } from '../feed-post/providers/feed-posts.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService, LocalStorageService, S3StorageService, FeedPostsService],
  exports: [UsersService],
})
export class UsersModule { }
