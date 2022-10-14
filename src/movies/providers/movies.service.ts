import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';
import { MovieActiveStatus, MovieDeletionStatus } from '../../schemas/movie/movie.enums';

@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movie.name) private moviesModel: Model<MovieDocument>) { }

  async create(movieData: Partial<Movie>): Promise<MovieDocument> {
    return this.moviesModel.create(movieData);
  }

  async update(id: string, movieData: Partial<Movie>): Promise<MovieDocument> {
    return this.moviesModel
      .findOneAndUpdate({ _id: id }, movieData, { new: true })
      .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<MovieDocument> {
    const moviesFindQuery: any = { _id: id };
    if (activeOnly) {
      moviesFindQuery.is_deleted = false;
      moviesFindQuery.status = MovieActiveStatus.Active;
    }
    return this.moviesModel.findOne(moviesFindQuery).exec();
  }

  async findFirstBySortName(sortNameStartsWith: string, activeOnly: boolean): Promise<MovieDocument> {
    const sortNameQuery: any = { sort_name: { $regex: new RegExp(`^${sortNameStartsWith}`) } };
    if (activeOnly) {
      sortNameQuery.is_deleted = MovieDeletionStatus.NotDeleted;
      sortNameQuery.status = MovieActiveStatus.Active;
    }
    return this.moviesModel
      .findOne(sortNameQuery)
      .sort({ sort_name: 1 })
      .exec();
  }

  async findFirstByReleaseYear(releaseYear: number, activeOnly: boolean): Promise<MovieDocument> {
    const releaseYearQuery: any = { releaseDate: { $gte: new Date(releaseYear, 1, 1), $lte: new Date(releaseYear, 12, 31) } };
    if (activeOnly) {
      releaseYearQuery.is_deleted = MovieDeletionStatus.NotDeleted;
      releaseYearQuery.status = MovieActiveStatus.Active;
    }
    return this.moviesModel
      .findOne(releaseYearQuery)
      .sort({ sortReleaseDate: 1 })
      .exec();
  }

  async findAll(
    limit: number,
    activeOnly: boolean,
    sortBy: 'name' | 'releaseDate',
    after?: mongoose.Types.ObjectId,
  ): Promise<MovieDocument[]> {
    const movieFindAllQuery: any = {};
    if (activeOnly) {
      movieFindAllQuery.is_deleted = MovieDeletionStatus.NotDeleted;
      movieFindAllQuery.status = MovieActiveStatus.Active;
    }
    if (after && sortBy === 'name') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sort_name = { $gt: afterMovie.sort_name };
    }
    if (after && sortBy === 'releaseDate') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sortReleaseDate = { $gt: afterMovie.sortReleaseDate };
    }

    const sortMoviesByNameAndReleaseDate: any = sortBy === 'name' ? { sort_name: 1 } : { sortReleaseDate: 1 };

    return this.moviesModel.find(movieFindAllQuery)
      .sort(sortMoviesByNameAndReleaseDate)
      .limit(limit)
      .exec();
  }
}
