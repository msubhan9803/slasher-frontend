import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPostsController } from './feed-post.controller';
import { FeedPostsService } from './providers/feed-post.service';
import { FeedPost, FeedPostSchema } from '../schemas/feedPost/feedPost.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedPost.name, schema: FeedPostSchema }]),
    FeedPostModule,
  ],
  providers: [FeedPostsService],
  exports: [FeedPostsService],
  controllers: [FeedPostsController],
})
export class FeedPostModule { }
