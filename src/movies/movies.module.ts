import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Movie, MovieSchema } from '../schemas/movie/movie.schema';
import { addPrePostHooks } from '../schemas/movie/movie.pre-post-hooks';
import { MoviesController } from './movies.controller';
import { MoviesService } from './providers/movies.service';
import { MovieUserStatusModule } from '../movie-user-status/movie.user.status.module';

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
    HttpModule,
    MovieUserStatusModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule { }
