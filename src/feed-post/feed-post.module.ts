import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPostsController } from './feed-post.controller';
import { FeedPostsService } from './providers/feed-post.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    FeedPostModule,
  ],
  providers: [FeedPostsService, LocalStorageService, S3StorageService],
  exports: [FeedPostsService],
  controllers: [FeedPostsController],
})
export class FeedPostModule { }
