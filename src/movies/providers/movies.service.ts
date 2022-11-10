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
    let imagesDataFromMDB = [];
    const insertedMovieList = [];
    const MOVIE_DB_API_BASE_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.MOVIE_DB_API_KEY}`;

    try {
      // Fetch the data year wise
      for (let year = startYear; year <= endYear; year += 1) {
        // Fetch the movie db paginated data
        let totalPages = 1;
        for (let i = 1; i <= totalPages; i += 1) {
          const { data } = await lastValueFrom(
            // eslint-disable-next-line max-len
            this.httpService.get<MovieDbDto>(`${MOVIE_DB_API_BASE_URL}&with_genres=27&language=en-US&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year}-12-31&page=${i}`),
            );
            if (i === 1) {
              totalPages = data.total_pages;
            }
            imagesDataFromMDB = [...imagesDataFromMDB, ...(data?.results || [])];
        }
      }

      // GET all the movies from our collection
      const movies = await this.moviesModel.find().exec();

      // make hash of collection data
      const moviesHash = {};
      for (const movie of movies) {
        moviesHash[movie.movieDBId] = movie;
      }

      // Iterate through movie db movies and make the database up to date with title
      for (const movie of imagesDataFromMDB) {
        if (movie.id in moviesHash) {
          await this.moviesModel.updateOne(({ movieDBId: movie.movieDBId }), { $set: { name: movie.title } });
        } else {
          insertedMovieList.push(DiscoverMovieMapper.toDomain(movie));
        }
      }

      // Insert all the new movies to collection
      if (insertedMovieList.length) { await this.moviesModel.insertMany(insertedMovieList); }
      return {
        success: true,
        message: `${insertedMovieList.length} record inserted. ${imagesDataFromMDB.length - insertedMovieList.length} record updated`,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
   }
}
