/* eslint-disable max-lines */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';

import { MovieActiveStatus, MovieDeletionStatus, MovieType } from '../../schemas/movie/movie.enums';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { DiscoverMovieMapper } from '../mapper/discover-movie.mapper';
import { MovieDbDto } from '../dto/movie-db.dto';
import { ReturnMovieDb } from '../dto/cron-job-response.dto';
import { DiscoverMovieDto } from '../dto/discover-movie.dto';
import { relativeToFullImagePath } from '../../utils/image-utils';
import { MovieUserStatus, MovieUserStatusDocument } from '../../schemas/movieUserStatus/movieUserStatus.schema';
import {
  MovieUserStatusBuy, MovieUserStatusFavorites, MovieUserStatusWatch, MovieUserStatusWatched,
} from '../../schemas/movieUserStatus/movieUserStatus.enums';

export interface Cast {
  'adult': boolean,
  'gender': number,
  'id': number,
  'known_for_department': string,
  'name': string,
  'original_name': string,
  'popularity': number,
  'profile_path': string,
  'cast_id': number,
  'character': string,
  'credit_id': string,
  'order': number
}

export interface Crew {
  'adult': boolean,
  'gender': number,
  'id': number,
  'known_for_department': string,
  'name': string,
  'original_name': string,
  'popularity': number,
  'profile_path': string,
  'department': string,
  'job': string,
  'credit_id': string,
}

export interface Results {
  'iso_639_1': string,
  'iso_3166_1': string,
  'name': string,
  'key': string,
  'site': string,
  'size': number,
  'type': string,
  'official': boolean,
  'published_at': string,
  'id': string
}

export interface VideoData {
  'results': Results[],
  'id': number
}

export interface Genres {
  'name': string,
  'id': number
}
export interface ProductionCountries {
  'name': string,
  'iso_3166_1': string
}
export interface SpokenLanguages {
  'name': string,
  'iso_639_1': string
}
export interface ProductionCompanies {
  'id': number,
  'name': string,
  'iso_3166_1': string,
  'logo_path': string,
  'origin_country': string,
}

export interface BelongsToCollection {
  'id': number,
  'name': string,
  'poster_path': string,
  'backdrop_path': string,
}

export interface MainData {
  'adult': boolean,
  'backdrop_path': string,
  'belongs_to_collection': BelongsToCollection,
  'budget': number,
  'genres': Genres[],
  'homepage': string,
  'id': number,
  'imdb_id': string,
  'original_language': string,
  'original_title': string,
  'overview': string,
  'popularity': number,
  'poster_path': string,
  'production_countries': ProductionCountries[],
  'release_date': string,
  'revenue': number,
  'runtime': number,
  'spoken_languages': SpokenLanguages[],
  'status': string,
  'tagline': string,
  'title': string,
  'vote_average': number,
  'video': boolean,
  'vote_count': number,
  'production_companies': ProductionCompanies[],
}

export interface MovieDbData {
  cast: Cast[],
  video: VideoData,
  mainData: MainData,
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private moviesModel: Model<MovieDocument>,
    @InjectModel(MovieUserStatus.name) private movieUserStatusModel: Model<MovieUserStatusDocument>,
    private httpService: HttpService,
    private configService: ConfigService,
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
    const releaseYearQuery: any = {
      releaseDate: {
        $gte: DateTime.fromISO(`${releaseYear}`, { zone: 'utc' }).startOf('year').toJSDate(),
        $lte: DateTime.fromISO(`${releaseYear}`, { zone: 'utc' }).endOf('year').toJSDate(),
      },
    };
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
    movieIdsIn?: mongoose.Types.ObjectId[],
    sortNameStartsWith?: string,
  ): Promise<MovieDocument[]> {
    const movieFindAllQuery: any = {
      type: MovieType.MovieDb,
    };
    if (movieIdsIn) {
      movieFindAllQuery._id = { $in: movieIdsIn };
    }
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
      movieFindAllQuery.sortReleaseDate = { $lt: afterMovie.sortReleaseDate };
    }
    if (after && sortBy === 'rating') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sortRating = { $lt: afterMovie.sortRating };
    }
    if (nameContains) {
      movieFindAllQuery.name = new RegExp(escapeStringForRegex(nameContains), 'i');
    }
    if (sortNameStartsWith) {
      movieFindAllQuery.sort_name = movieFindAllQuery.sort_name || {};
      movieFindAllQuery.sort_name.$regex = new RegExp(`^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`);
    }

    let sortMoviesByNameAndReleaseDate: any;
    if (sortBy === 'name') {
      sortMoviesByNameAndReleaseDate = { sort_name: 1 };
    } else if (sortBy === 'releaseDate') {
      sortMoviesByNameAndReleaseDate = { sortReleaseDate: -1 };
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

      // From MovieDB
      const moviesFromMovieDB = { ids: [] };

      // Fetch `movieDBId` to check for already existing movies later
      const databaseMovieKeys = [];
      for await (
        const doc of this.moviesModel
          .find()
          .select('movieDBId')
          .cursor()
      ) {
        databaseMovieKeys.push(doc.movieDBId);
      }

      // Fetch the data year wise
      for (let year = startYear; year <= maxYearLimit; year += 1) {
        await this.fetchMovieData(`${year}-01-01`, `${year}-12-31`, databaseMovieKeys, moviesFromMovieDB);
      }

      // Mark the deleted record on field deleted
      const deletedRecordKeys = [];
      for (const movieId of databaseMovieKeys) {
        const existing = moviesFromMovieDB.ids.find((id) => id === movieId);
        if (!existing) {
          deletedRecordKeys.push(movieId);
        }
      }
      await this.moviesModel.updateMany(({ movieDBId: { $in: deletedRecordKeys } }), { $set: { deleted: MovieDeletionStatus.Deleted } });

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

  async fetchMovieData(startDate: string, endDate: string, databaseMovieKeys, moviesFromMovieDB) {
    const options: Omit<MovieDbDto, 'results' | 'total_results'> = { page: 1, total_pages: 1 };
    options.page = 1;

    do {
      const movieData: MovieDbDto | null = await this.fetchMovieDataAPI(startDate, endDate, options.page);
      if (movieData) {
        options.total_pages = movieData.total_pages;
        options.page = movieData.page + 1;

        // eslint-disable-next-line no-param-reassign
        moviesFromMovieDB.ids = [...moviesFromMovieDB.ids, ...movieData.results.map((movie) => movie.id)];
        try {
          await this.processDatabaseOperation(movieData.results, databaseMovieKeys);
        } catch (error) {
          throw new Error('Failed to fetch movies');
        }
      }
    } while (options.page <= options.total_pages);
  }

  async fetchMovieDataAPI(startDate: string, endDate: string, page: number): Promise<MovieDbDto | null> {
    const MOVIE_DB_API_BASE_URL = 'https://api.themoviedb.org/3/discover/movie?api_key='
      + `${this.configService.get<string>('MOVIE_DB_API_KEY')}`;
    try {
      const { data } = await lastValueFrom(
        this.httpService.get<MovieDbDto>(
          `${MOVIE_DB_API_BASE_URL}&with_genres=27&language=en-US&`
          + `primary_release_date.gte=${startDate}&`
          + `primary_release_date.lte=${endDate}&page=${page}`,
        ),
      );
      return data;
    } catch (error) {
      return null;
    }
  }

  async processDatabaseOperation(
    movies: DiscoverMovieDto[],
    databaseMovieKeys,
  ): Promise<void> {
    if (!movies && movies.length) {
      return;
    }

    const insertedMovieList = [];

    const promisesArray = [];
    for (const movie of movies) {
      if (databaseMovieKeys.includes(movie.id)) {
        const movieData = await this.moviesModel.findOne({ movieDBId: movie.id });
        if (movieData) {
          for (const movieKey of Object.keys(DiscoverMovieMapper.toDomain(movie))) {
            movieData[movieKey] = DiscoverMovieMapper.toDomain(movie)[movieKey];
          }
          promisesArray.push(movieData.save());
        }
      } else {
        insertedMovieList.push(DiscoverMovieMapper.toDomain(movie));
      }
    }

    // Update all existing records
    await Promise.all(promisesArray);

    // Insert all the new movies to collection
    if (insertedMovieList.length) { await this.moviesModel.insertMany(insertedMovieList); }
  }

  async getMoviesDataMaxYearLimit(endYear: number): Promise<number> {
    const MOVIE_DB_API_BASE_URL = 'https://api.themoviedb.org/3/discover/movie?api_key='
      + `${this.configService.get<string>('MOVIE_DB_API_KEY')}`;
    try {
      // Apply the sort on data to get the max year limit
      const { data } = await lastValueFrom(
        this.httpService.get<MovieDbDto>(`${MOVIE_DB_API_BASE_URL}&with_genres=27&language=en-US&sort_by=primary_release_date.desc`),
      );
      if (data.results.length) {
        const maxEndYearFromResponse = Number(new Date(data.results[0].release_date).getFullYear().toString().split('-')[0]);
        return Math.min(endYear, maxEndYearFromResponse);
      }
      return endYear;
    } catch (error) {
      return endYear;
    }
  }

  async fetchMovieDbData(movieDbId: number): Promise<MovieDbData> {
    const movieDbApiKey = this.configService.get<string>('MOVIE_DB_API_KEY');
    const [castAndCrewData, videoData, mainDetails, configDetails]: any = await Promise.all([
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}/credits?api_key=${movieDbApiKey}&language=en-US`,
      )),
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}/videos?api_key=${movieDbApiKey}&language=en-US`,
      )),
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}?api_key=${movieDbApiKey}&language=en-US&append_to_response=release_dates`,
      )),
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/configuration?api_key=${movieDbApiKey}`,
      )),
    ]);

    const mainData = JSON.parse(JSON.stringify(mainDetails.data));
    if (mainData.poster_path) {
      // eslint-disable-next-line no-param-reassign
      mainData.poster_path = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${mainDetails.data.poster_path}`;
    } else {
      // eslint-disable-next-line no-param-reassign
      mainData.poster_path = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }
    const secureBaseUrl = `${configDetails.data.images.secure_base_url}w185`;
    const cast = JSON.parse(JSON.stringify(castAndCrewData.data.cast));

    cast.forEach((profile) => {
      if (profile.profile_path) {
        // eslint-disable-next-line no-param-reassign
        profile.profile_path = `${secureBaseUrl}${profile.profile_path}`;
      } else {
        // eslint-disable-next-line no-param-reassign
        profile.profile_path = relativeToFullImagePath(this.configService, '/placeholders/movie_cast.png');
      }
      return profile;
    });

    const expectedCastValues = [];
    cast.map((data) => expectedCastValues.push({
      profile_path: data.profile_path,
      character: data.character,
      name: data.name,
    }));

    const expectedVideosValues: any = [];
    videoData.data.results.map((video) => expectedVideosValues.push({
      key: video.key,
    }));

    const expectedMainData: any = {
      overview: mainData.overview,
      poster_path: mainData.poster_path,
      release_dates: mainData.release_dates,
      runtime: mainData.runtime,
      title: mainData.title,
      original_title: mainData.original_title,
      production_countries: mainData.production_countries,
      release_date: mainData.release_date,
    };

    return {
      cast: expectedCastValues,
      video: expectedVideosValues,
      mainData: expectedMainData,
    };
  }

  async getWatchedListMovieIdsForUser(userId: string): Promise<Partial<MovieUserStatusDocument[]>> {
    const watchedMovieIdByUser = await this.movieUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), watched: MovieUserStatusWatched.Watched }, { movieId: 1, _id: 0 })
      .exec();
    const watchedMovieIdArray = watchedMovieIdByUser.map((movie) => movie.movieId);
    return watchedMovieIdArray as unknown as MovieUserStatusDocument[];
  }

  async getWatchListMovieIdsForUser(userId: string): Promise<Partial<MovieUserStatusDocument[]>> {
    const watchMovieIdByUser = await this.movieUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), watch: MovieUserStatusWatch.Watch }, { movieId: 1, _id: 0 })
      .exec();
    const watchMovieIdArray = watchMovieIdByUser.map((movie) => movie.movieId);
    return watchMovieIdArray as unknown as MovieUserStatusDocument[];
  }

  async getBuyListMovieIdsForUser(userId: string): Promise<Partial<MovieUserStatusDocument[]>> {
    const buyMovieIdByUser = await this.movieUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), buy: MovieUserStatusBuy.Buy }, { movieId: 1, _id: 0 })
      .exec();
    const buyMovieIdArray = buyMovieIdByUser.map((movie) => movie.movieId);
    return buyMovieIdArray as unknown as MovieUserStatusDocument[];
  }

  async getFavoriteListMovieIdsForUser(userId: string): Promise<Partial<MovieUserStatusDocument[]>> {
    const favoriteMovieIdByUser = await this.movieUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), favourite: MovieUserStatusFavorites.Favorite }, { movieId: 1, _id: 0 })
      .exec();
    const favoriteMovieIdArray = favoriteMovieIdByUser.map((movie) => movie.movieId);
    return favoriteMovieIdArray as unknown as MovieUserStatusDocument[];
  }
}
