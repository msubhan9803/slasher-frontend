import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';

import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';
import { MovieActiveStatus, MovieDeletionStatus } from '../../schemas/movie/movie.enums';

import { escapeStringForRegex } from '../../utils/escape-utils';
import { DiscoverMovieMapper } from '../mapper/discover-movie.mapper';
import { MovieDbDto } from '../dto/movie-db.dto';
import { ReturnMovieDb } from '../dto/cron-job-response.dto';
import { DiscoverMovieDto } from '../dto/discover-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private moviesModel: Model<MovieDocument>,
    private httpService: HttpService,
  ) { }

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
    const sortNameQuery: any = { sort_name: new RegExp(`^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`) };
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
    sortBy: 'name' | 'releaseDate' | 'rating',
    after?: mongoose.Types.ObjectId,
    nameContains?: string,

  ): Promise<MovieDocument[]> {
    const movieFindAllQuery: any = {};
    if (activeOnly) {
      movieFindAllQuery.deleted = MovieDeletionStatus.NotDeleted;
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
    if (after && sortBy === 'rating') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sortRating = { $lt: afterMovie.sortRating };
    }
    if (nameContains) {
      movieFindAllQuery.name = new RegExp(escapeStringForRegex(nameContains), 'i');
    }
    let sortMoviesByNameAndReleaseDate: any;
    if (sortBy === 'name') {
      sortMoviesByNameAndReleaseDate = { sort_name: 1 };
    } else if (sortBy === 'releaseDate') {
      sortMoviesByNameAndReleaseDate = { sortReleaseDate: 1 };
    } else {
      sortMoviesByNameAndReleaseDate = { sortRating: -1 };
    }
    return this.moviesModel.find(movieFindAllQuery)
      .sort(sortMoviesByNameAndReleaseDate)
      .limit(limit)
      .exec();
  }

  async syncWithTheMovieDb(startYear: number, endYear: number): Promise<ReturnMovieDb> {
    try {
       // Fetch the max year data limit
      const maxYearLimit = await this.getMoviesDataMaxYearLimit(endYear);

      // Fetch the data year wise
      for (let year = startYear; year <= maxYearLimit; year += 1) {
        await this.fetchMovieData(`${year}-01-01`, `${year}-12-31`);
      }

      return {
        success: true,
        message: 'Successfully completed the cron job',
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async fetchMovieData(startDate: string, endDate: string) {
    const options: Omit<MovieDbDto, 'results' | 'total_results'> = { page: 1, total_pages: 1 };
    options.page = 1;
    do {
      const movieData: MovieDbDto | null = await this.fetchMovieDataAPI(startDate, endDate, options.page);
      if (movieData) {
        options.total_pages = movieData.total_pages;
        options.page = movieData.page + 1;

        await this.processDatabaseOperation(startDate, endDate, movieData.results);
      }
    } while (options.page <= options.total_pages);
  }

  async fetchMovieDataAPI(startDate: string, endDate: string, page: number): Promise<MovieDbDto | null> {
    const MOVIE_DB_API_BASE_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.MOVIE_DB_API_KEY}`;
    try {
      const { data } = await lastValueFrom(
        // eslint-disable-next-line max-len
        this.httpService.get<MovieDbDto>(`${MOVIE_DB_API_BASE_URL}&with_genres=27&language=en-US&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&page=${page}`),
        );
        return data;
    } catch (error) {
      return null;
    }
   }

  async processDatabaseOperation(startDate: string, endDate: string, movies: DiscoverMovieDto[]): Promise<void> {
    if (!movies && movies.length) {
      return;
    }

    const insertedMovieList = [];
    // Fetch the movies from collection based on yearly data
    const databaseMovies = await this.moviesModel.find(({ releaseDate: { $lte: new Date(endDate), $gte: new Date(startDate) } })).exec();

    const databaseMovieKeys = databaseMovies.map(({ movieDBId }) => movieDBId);
    const promisesArray = [];
    for (const movie of movies) {
      if (databaseMovieKeys.includes(movie.id)) {
        promisesArray.push(this.moviesModel.updateOne(({ movieDBId: movie.id }), { $set: { name: movie.title } }));
      } else {
        insertedMovieList.push(DiscoverMovieMapper.toDomain(movie));
      }
    }

    // Update all existing records
    await Promise.all(promisesArray);

    // Insert all the new movies to collection
    if (insertedMovieList.length) { await this.moviesModel.insertMany(insertedMovieList); }

    // Mark the deleted record on field deleted
    const deletedRecordKeys = [];
    for (const movieId of databaseMovieKeys) {
      const existing = movies.find(({ id }) => id === movieId);
      if (!existing) {
        deletedRecordKeys.push(movieId);
      }
    }

    await this.moviesModel.updateMany(({ movieDBId: { $in: deletedRecordKeys } }), { $set: { deleted: MovieDeletionStatus.Deleted } });
  }

  async getMoviesDataMaxYearLimit(endYear: number): Promise<number> {
    const MOVIE_DB_API_BASE_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.MOVIE_DB_API_KEY}`;
    try {
      // Apply the sort on data to get the max year limit
      const { data } = await lastValueFrom(
        this.httpService.get<MovieDbDto>(`${MOVIE_DB_API_BASE_URL}&with_genres=27&language=en-US&sort_by=primary_release_date.desc`),
        );
        if (data.results.length) {
          return Number(data.results[0].release_date.toString().split('-')[0]);
        }
        return endYear;
    } catch (error) {
      return endYear;
    }
  }
}
