import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
 MovieUserStatusBuy, MovieUserStatusFavorites, MovieUserStatusWatch, MovieUserStatusWatched,
} from '../../schemas/movieUserStatus/movieUserStatus.enums';
import { MovieUserStatus, MovieUserStatusDocument } from '../../schemas/movieUserStatus/movieUserStatus.schema';

@Injectable()
export class MovieUserStatusService {
  constructor(@InjectModel(MovieUserStatus.name) private movieUserStatusModel: Model<MovieUserStatusDocument>) { }

  async addMovieUserStatusFavorite(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { favourite: MovieUserStatusFavorites.Favorite } },
      { upsert: true },
    );
  }

  async deleteMovieUserStatusFavorite(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { favourite: MovieUserStatusFavorites.NotFavorite } },
    );
  }

  async addMovieUserStatusWatch(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { watch: MovieUserStatusWatch.Watch } },
      { upsert: true },
    );
  }

  async deleteMovieUserStatusWatch(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { watch: MovieUserStatusWatch.NotWatch } },
    );
  }

  async addMovieUserStatusWatched(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { watched: MovieUserStatusWatched.Watched } },
      { upsert: true },
    );
  }

  async deleteMovieUserStatusWatched(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { watched: MovieUserStatusWatched.NotWatched } },
    );
  }

  async addMovieUserStatusBuy(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { buy: MovieUserStatusBuy.Buy } },
      { upsert: true },
    );
  }

  async deleteMovieUserStatusBuy(userId: string, movieId: string): Promise<void> {
    await this.movieUserStatusModel.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        movieId: new mongoose.Types.ObjectId(movieId),
      },
      { $set: { buy: MovieUserStatusBuy.NotBuy } },
    );
  }

  async findMovieUserStatus(userId: string, movieId: string): Promise<MovieUserStatus> {
    const movieUserStatus = await this.movieUserStatusModel
      .findOne({
        $and: [{ userId: new mongoose.Types.ObjectId(userId) }, { movieId: new mongoose.Types.ObjectId(movieId) }],
      })
      .exec();
    return movieUserStatus;
  }
}
