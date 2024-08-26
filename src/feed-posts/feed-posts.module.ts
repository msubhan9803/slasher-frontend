import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessListing, BusinessListingSchema } from '../schemas/businessListing/businessListing.schema';
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
import { FriendsGateway } from '../friends/providers/friends.gateway';
import { Hashtag, HashtagSchema } from '../schemas/hastag/hashtag.schema';
import { HashtagFollowsModule } from '../hashtag-follows/hashtag-follows.module';
import { PostAccessService } from './providers/post-access.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FeedPostLike.name, schema: FeedPostLikeSchema }]),
    MongooseModule.forFeature([{ name: BlockAndUnblock.name, schema: BlockAndUnblockSchema }]),
    MongooseModule.forFeature([{ name: Hashtag.name, schema: HashtagSchema }]),
    MongooseModule.forFeature([{ name: BusinessListing.name, schema: BusinessListingSchema }]),
    RssFeedProviderFollowsModule,
    FriendsModule,
    BlocksModule,
    HashtagModule,
    MovieUserStatusModule,
    HashtagFollowsModule,
  ],
  providers: [FeedPostsService, PostAccessService, BlocksService, LocalStorageService, S3StorageService, FriendsGateway],
  exports: [FeedPostsService, PostAccessService, FriendsGateway],
  controllers: [FeedPostsController],
})
export class FeedPostsModule { }
