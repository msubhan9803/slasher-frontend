import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Movie, MovieSchema } from '../schemas/movie/movie.schema';
import { addPrePostHooks } from '../schemas/movie/movie.pre-post-hooks';
import { MoviesController } from './movies.controller';
import { MoviesService } from './providers/movies.service';
import { User, UserSchema } from '../schemas/user/user.schema';
import { MovieUserStatusModule } from '../movie-user-status/movie.user.status.module';
import { MovieUserStatus, MovieUserStatusSchema } from '../schemas/movieUserStatus/movieUserStatus.schema';
import { RecentMovieBlock, RecentMovieBlockSchema } from '../schemas/recentMovieBlock/recentMovieBlock.schema';

@Global()
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: MovieUserStatus.name, schema: MovieUserStatusSchema }]),
    MongooseModule.forFeature([{ name: RecentMovieBlock.name, schema: RecentMovieBlockSchema }]),
    HttpModule,
    MovieUserStatusModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule { }
