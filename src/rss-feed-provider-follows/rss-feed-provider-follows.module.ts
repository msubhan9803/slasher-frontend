import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedProviderFollow, RssFeedProviderFollowSchema } from '../schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';
import { RssFeedProviderFollowsService } from './providers/rss-feed-provider-follows.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RssFeedProviderFollow.name, schema: RssFeedProviderFollowSchema }]),
  ],
  providers: [RssFeedProviderFollowsService],
  exports: [RssFeedProviderFollowsService],
  controllers: [],
})
export class RssFeedProviderFollowsModule { }
