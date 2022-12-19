import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeedProvider, RssFeedProviderSchema } from '../schemas/rssFeedProvider/rssFeedProvider.schema';
import { addPrePostHooks } from '../schemas/rssFeedProvider/rssFeedProvider.pre-post-hooks';
import { RssFeedProvidersService } from './providers/rss-feed-providers.service';
import { RssFeedProvidersController } from './rss-feed-providers.controller';
import { FeedPostsModule } from '../feed-posts/feed-posts.module';
import { RssFeedProviderFollowsModule } from '../rss-feed-provider-follows/rss-feed-provider-follows.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RssFeedProvider.name,
        useFactory: () => {
          const schema = RssFeedProviderSchema;
          addPrePostHooks(schema);
          return schema;
        },
      },
    ]),
    FeedPostsModule,
    RssFeedProviderFollowsModule,
  ],
  controllers: [RssFeedProvidersController],
  providers: [RssFeedProvidersService],
  exports: [RssFeedProvidersService],
})
export class RssFeedProvidersModule { }
