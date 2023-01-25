import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPostsController } from './feed-posts.controller';
import { FeedPostsService } from './providers/feed-posts.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { RssFeedProviderFollowsModule } from '../rss-feed-provider-follows/rss-feed-provider-follows.module';
import { FriendsModule } from '../friends/friends.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    RssFeedProviderFollowsModule,
    FriendsModule,
    BlocksModule,
  ],
  providers: [FeedPostsService, LocalStorageService, S3StorageService],
  exports: [FeedPostsService],
  controllers: [FeedPostsController],
})
export class FeedPostsModule { }
