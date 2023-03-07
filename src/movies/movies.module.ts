import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Movie, MovieSchema } from '../schemas/movie/movie.schema';
import { addPrePostHooks } from '../schemas/movie/movie.pre-post-hooks';
import { MoviesController } from './movies.controller';
import { MoviesService } from './providers/movies.service';
import { User, UserSchema } from '../schemas/user/user.schema';
import { MovieUserStatusModule } from '../movie-user-status/movie.user.status.module';
import { MovieUserStatus, MovieUserStatusSchema } from '../schemas/movieUserStatus/movieUserStatus.schema';
//TO-DO: remove this lint disable
// eslint-disable-next-line
import { FeedPostsModule } from '../feed-posts/feed-posts.module';

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
    HttpModule,
    MovieUserStatusModule,
    forwardRef(() => FeedPostsModule),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule { }
