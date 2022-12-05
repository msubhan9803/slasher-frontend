import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { FeedPostLike, FeedPostLikeSchema } from '../schemas/feedPostLike/feedPostLike.schema';
import { FeedLikesService } from './providers/feed-likes.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';
import { FeedComment, FeedCommentSchema } from '../schemas/feedComment/feedComment.schema';
import { FeedReplyLike, FeedReplyLikeSchema } from '../schemas/feedReplyLike/feedReplyLike.schema';
import { FeedReply, FeedReplySchema } from '../schemas/feedReply/feedReply.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPostLike.name, schema: FeedPostLikeSchema }]),
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    MongooseModule.forFeature([{ name: FeedReply.name, schema: FeedReplySchema }]),
    MongooseModule.forFeature([{ name: FeedComment.name, schema: FeedCommentSchema }]),
    MongooseModule.forFeature([{ name: FeedReplyLike.name, schema: FeedReplyLikeSchema }]),
    FeedPostsModule,
  ],
  providers: [FeedLikesService],
  exports: [FeedLikesService],
  controllers: [],
})
export class FeedLikesModule { }
