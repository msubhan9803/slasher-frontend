import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MusicService } from './providers/music.service';
import { MusicController } from './music.controller';
import { Music, MusicSchema } from '../schemas/music/music.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Music.name,
        useFactory: () => {
          const schema = MusicSchema;
          return schema;
        },
      },
    ]),
    HttpModule,
  ],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule { }
