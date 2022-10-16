import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from '../schemas/movie/movie.schema';
import { addPrePostHooks } from '../schemas/movie/movie.pre-post-hooks';
import { MoviesController } from './movies.controller';
import { MoviesService } from './providers/movies.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Movie.name,
        useFactory: () => {
          const schema = MovieSchema;
          addPrePostHooks(schema);
          return schema;
        },
      },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule { }
