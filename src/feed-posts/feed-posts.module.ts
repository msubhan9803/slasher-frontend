import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPostsController } from './feed-posts.controller';
import { FeedPostsService } from './providers/feed-posts.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { RssFeedProviderFollowsModule } from '../rss-feed-provider-follows/rss-feed-provider-follows.module';
import { User, UserSchema } from '../schemas/user/user.schema';
import { FeedPostLike, FeedPostLikeSchema } from '../schemas/feedPostLike/feedPostLike.schema';
import { BlocksService } from '../blocks/providers/blocks.service';
import { BlockAndUnblock, BlockAndUnblockSchema } from '../schemas/blockAndUnblock/blockAndUnblock.schema';
import { FriendsModule } from '../friends/friends.module';
import { BlocksModule } from '../blocks/blocks.module';
import { HashtagModule } from '../hashtag/hashtag.module';
import { MovieUserStatusModule } from '../movie-user-status/movie.user.status.module';
import { Hashtag, HashtagSchema } from '../schemas/hastag/hashtag.schema';
import { HashtagFollowsModule } from '../hashtag-follows/hashtag-follows.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FeedPostLike.name, schema: FeedPostLikeSchema }]),
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
    RssFeedProviderFollowsModule,
    FriendsModule,
    BlocksModule,
    HashtagModule,
    MovieUserStatusModule,
    HashtagFollowsModule,
  ],
  providers: [FeedPostsService, BlocksService, LocalStorageService, S3StorageService],
  exports: [FeedPostsService],
  controllers: [FeedPostsController],
})
export class FeedPostsModule { }
