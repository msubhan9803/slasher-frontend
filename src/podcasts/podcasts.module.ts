import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { PodcastsService } from './providers/podcasts.service';
import { PodcastsController } from './podcasts.controller';
import { Podcast, PodcastSchema } from '../schemas/podcast/podcast.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Podcast.name,
        useFactory: () => {
          const schema = PodcastSchema;
          return schema;
        },
      },
    ]),
    HttpModule,
  ],
  controllers: [PodcastsController],
  providers: [PodcastsService],
  exports: [PodcastsService],
})
export class PodcastsModule {}
