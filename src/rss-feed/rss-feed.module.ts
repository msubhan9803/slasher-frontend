import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RssFeed, RssFeedSchema } from '../schemas/rssFeed/rssFeed.schema';
import { RssFeedService } from './providers/rss-feed.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RssFeed.name,
        useFactory: () => {
          const schema = RssFeedSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [RssFeedService],
  exports: [],
})
export class RssFeedModule { }
