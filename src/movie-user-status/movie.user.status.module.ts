import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieUserStatus, MovieUserStatusSchema } from '../schemas/movieUserStatus/movieUserStatus.schema';
import { MovieUserStatusService } from './providers/movie-user-status.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MovieUserStatus.name, schema: MovieUserStatusSchema }]),
  ],
  providers: [MovieUserStatusService],
  exports: [MovieUserStatusService],
  controllers: [],
})
export class MovieUserStatusModule { }
