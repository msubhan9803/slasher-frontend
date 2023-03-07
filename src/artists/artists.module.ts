import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ArtistsService } from './providers/artists.service';
import { ArtistsController } from './artists.controller';
import { Artist, ArtistSchema } from '../schemas/artist/artist.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Artist.name,
        useFactory: () => {
          const schema = ArtistSchema;
          return schema;
        },
      },
    ]),
    HttpModule,
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
