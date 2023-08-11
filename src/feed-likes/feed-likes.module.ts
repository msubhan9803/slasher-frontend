/*eslint-disable import/no-cycle*/
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedCommentsModule } from '../feed-comments/feed-comments.module';
import { FeedPostLike, FeedPostLikeSchema } from '../schemas/feedPostLike/feedPostLike.schema';
import { FeedLikesService } from './providers/feed-likes.service';
import { FeedComment, FeedCommentSchema } from '../schemas/feedComment/feedComment.schema';
import { FeedReplyLike, FeedReplyLikeSchema } from '../schemas/feedReplyLike/feedReplyLike.schema';
import { FeedReply, FeedReplySchema } from '../schemas/feedReply/feedReply.schema';
import { FeedLikesController } from './feed-likes.controller';
import { BlocksModule } from '../blocks/blocks.module';
import { User, UserSchema } from '../schemas/user/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FeedPostLike.name, schema: FeedPostLikeSchema }]),
    MongooseModule.forFeature([{ name: FeedReply.name, schema: FeedReplySchema }]),
    MongooseModule.forFeature([{ name: FeedComment.name, schema: FeedCommentSchema }]),
    MongooseModule.forFeature([{ name: FeedReplyLike.name, schema: FeedReplyLikeSchema }]),
    FeedCommentsModule,
    BlocksModule,
  ],
  providers: [FeedLikesService],
  exports: [FeedLikesService],
  controllers: [FeedLikesController],
})
export class FeedLikesModule { }
