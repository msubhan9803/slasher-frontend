import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedCommentsController } from './feed-comments.controller';
import { FeedCommentsService } from './providers/feed-comments.service';
import { FeedComment, FeedCommentSchema } from '../schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplySchema } from '../schemas/feedReply/feedReply.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { FriendsModule } from '../friends/friends.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedComment.name, schema: FeedCommentSchema }]),
    MongooseModule.forFeature([{ name: FeedReply.name, schema: FeedReplySchema }]),
    FriendsModule,
  ],
  providers: [FeedCommentsService, LocalStorageService, S3StorageService],
  exports: [FeedCommentsService],
  controllers: [FeedCommentsController],
})
export class FeedCommentsModule { }
