import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashTagsFollow, HashTagsFollowSchema } from '../schemas/hashtagFollow/hashtagFollows.schema';
import { HashtagFollowsService } from './providers/hashtag-follows.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HashTagsFollow.name, schema: HashTagsFollowSchema }]),
  ],
  providers: [HashtagFollowsService],
  exports: [HashtagFollowsService],
  controllers: [],
})
export class HashtagFollowsModule { }
