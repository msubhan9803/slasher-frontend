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
  MovieUserStatusBuy, MovieUserStatusFavorites,
  MovieUserStatusWatch, MovieUserStatusWatched,
} from '../../schemas/movieUserStatus/movieUserStatus.enums';
import { WorthWatchingStatus } from '../../types';
import { NON_ALPHANUMERIC_REGEX } from '../../constants';
import { getSortSafeWeightedRatingOfMovie } from '../../schemas/movie/movie.pre-post-hooks';

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

  async findById(id: string, activeOnly: boolean): Promise<Movie> {
    const moviesFindQuery: any = { _id: id };
    if (activeOnly) {
      moviesFindQuery.is_deleted = false;
      moviesFindQuery.status = MovieActiveStatus.Active;
    }
    const movieData = await this.moviesModel.findOne(moviesFindQuery).exec();
    return movieData ? movieData.toObject() : null;
  }

  async updateMoviePostFields(moviePostFields, feedPost) {
    if (moviePostFields.rating) {
      await this.createOrUpdateRating(
        feedPost.movieId.toString(),
        moviePostFields.rating,
        feedPost.userId,
      );
    }
    if (moviePostFields.goreFactorRating) {
      await this.createOrUpdateGoreFactorRating(
        feedPost.movieId.toString(),
        moviePostFields.goreFactorRating,
        feedPost.userId,
      );
    }
    if (typeof moviePostFields.worthWatching === 'number') {
      await this.createOrUpdateWorthWatching(
        feedPost.movieId.toString(),
        moviePostFields.worthWatching,
        feedPost.userId,
      );
    }
  }

  async createOrUpdateRating(movieId: string, rating: number, userId: string) {
    // Create/update a MovieUserStatus document
    const movieUserStatus = await this.movieUserStatusModel.findOneAndUpdate(
      { movieId, userId },
      { $set: { rating } },
      { upsert: true, new: true },
    );
    // Calculate average of all `movieUserStatuses` documents for a given `movieId` (ignore 0 rating)
    const aggregate = await this.movieUserStatusModel.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId), rating: { $exists: true, $ne: 0 } } },
      { $group: { _id: 'movieId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Movie> = { rating: 0, ratingUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageRating, count }] = aggregate;
      update.rating = averageRating.toFixed(1);
      update.ratingUsersCount = count;
    }
    // Update properties related to `rating`
    const movie = (await this.moviesModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(movieId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...movie, userData: movieUserStatus };
  }

  async createOrUpdateGoreFactorRating(movieId: string, goreFactorRating: number, userId: string) {
    // Create/update a MovieUserStatus document
    const movieUserStatus = await this.movieUserStatusModel.findOneAndUpdate(
      { movieId, userId },
      { $set: { goreFactorRating } },
      { upsert: true, new: true },
    );
    // Calculate average of all `movieUserStatuses` documents for a given `movieId` (ignore 0 goreFactorRating)
    const aggregate = await this.movieUserStatusModel.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId), goreFactorRating: { $exists: true, $ne: 0 } } },
      { $group: { _id: 'movieId', averageGoreFactorRating: { $avg: '$goreFactorRating' }, count: { $sum: 1 } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Movie> = { goreFactorRating: 0, goreFactorRatingUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageGoreFactorRating, count }] = aggregate;
      update.goreFactorRating = averageGoreFactorRating.toFixed(1);
      update.goreFactorRatingUsersCount = count;
    }
    // Update properties related to `goreFactorRating`
    const movie = (await this.moviesModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(movieId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...movie, userData: movieUserStatus };
  }

  async getUserMovieStatusRatings(movieId: string, userId: string) {
    const movieUserStatus = await this.movieUserStatusModel.findOne({ movieId, userId }).select({
      rating: 1, goreFactorRating: 1, worthWatching: 1,
    });
    return movieUserStatus;
  }

  async createOrUpdateWorthWatching(movieId: string, worthWatching: number, userId: string) {
    // Create/update a MovieUserStatus document
    const movieUserStatus = await this.movieUserStatusModel.findOneAndUpdate(
      { movieId, userId },
      { $set: { worthWatching } },
      { upsert: true, new: true },
    );
    // Calculate average of all `movieUserStatuses` documents for a given `movieId` (ignore 0 goreFactorRating)
    const aggregate = await this.movieUserStatusModel.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId), worthWatching: { $exists: true, $ne: WorthWatchingStatus.NoRating } } },
      { $group: { _id: 'movieId', averageWorthWatching: { $avg: '$worthWatching' } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Movie> = { worthWatching: 0, worthWatchingUpUsersCount: 0, worthWatchingDownUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageWorthWatching }] = aggregate;
      update.worthWatching = Math.round(averageWorthWatching);
      update.worthWatchingUpUsersCount = await this.movieUserStatusModel.count({ movieId, worthWatching: { $eq: WorthWatchingStatus.Up } });
      update.worthWatchingDownUsersCount = await this.movieUserStatusModel.count({
        movieId,
        worthWatching: { $eq: WorthWatchingStatus.Down },
      });
    }
    // Update properties related to `worthWatch`
    const movie = (await this.moviesModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(movieId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...movie, userData: movieUserStatus };
  }

  async getRatingUsersCount(movieId: string) {
    return this.movieUserStatusModel.count({ movieId, rating: { $exists: true, $ne: 0 } });
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
      movieFindAllQuery.sort_name = { ...movieFindAllQuery.sort_name, $gt: afterMovie.sort_name };
    }
    if (after && sortBy === 'releaseDate') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sortReleaseDate = { $lt: afterMovie.sortReleaseDate };
    }
    if (after && sortBy === 'rating') {
      const afterMovie = await this.moviesModel.findById(after);
      movieFindAllQuery.sortRatingAndRatingUsersCount = { $lt: afterMovie.sortRatingAndRatingUsersCount };
    }
    if (nameContains) {
      movieFindAllQuery.name = {};
      movieFindAllQuery.name.$regex = new RegExp(escapeStringForRegex(nameContains), 'i');
    }
    if (sortNameStartsWith) {

      let combinedRegex = '';
      if (nameContains) {
        movieFindAllQuery.name.$regex = new RegExp(escapeStringForRegex(nameContains), 'i');
      }
      if (sortNameStartsWith && sortNameStartsWith !== '#') {
        movieFindAllQuery.sort_name = movieFindAllQuery.sort_name || {};
        combinedRegex = `^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`;
        movieFindAllQuery.sort_name.$regex = new RegExp(combinedRegex, 'i');
      } else if (sortNameStartsWith === '#') {
        combinedRegex = NON_ALPHANUMERIC_REGEX.source;
        movieFindAllQuery.name = movieFindAllQuery.name || {};
        movieFindAllQuery.name.$regex = new RegExp(combinedRegex, 'i');
      }
    }

    let sortMoviesByNameAndReleaseDate: any;
    if (sortBy === 'name') {
      sortMoviesByNameAndReleaseDate = { sort_name: 1 };
    } else if (sortBy === 'releaseDate') {
      sortMoviesByNameAndReleaseDate = { sortReleaseDate: -1 };
    } else {
      sortMoviesByNameAndReleaseDate = { sortRatingAndRatingUsersCount: -1 };
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

      // TODO-SAHIL: Rename below variable to `movieIdFromMovieDB`
      // From MovieDB, we collect ids of all the movies between `startYear` to `maxYearLimit`
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

  // eslint-disable-next-line class-methods-use-this
  async testFunction() {
    // eslint-disable-next-line no-console
    console.log('hello');
    let i = 1;
    // let CONTINUE = true;
    // let sum = 0;
    // let numOfItems  = 0;
    // eslint-disable-next-line no-unreachable-loop
    for await (
      const doc of this.moviesModel
        .find()
        .cursor()
    ) {
      // 5da965d801651524ded15c88
      // console.log(i);
      // eslint-disable-next-line no-plusplus
      i++;
      // if (doc._id.toString() === '5def446422f6901701a95145') {
      //   CONTINUE = false;
      // }

      // if (CONTINUE) { continue; }
      // if (i === 10) { break; }
      if ((i % 1000) === 0) {
        // eslint-disable-next-line no-console
        console.log('items processed?', i);
      }
      // const ratingUsersCount = await this.getRatingUsersCount(doc._id.toString());
      // const kk = generateSortRatingAndRatingUsersCount(doc.rating, ratingUsersCount, doc._id.toString());
      // const kk = generateSortRatingAndRatingUsersCount(doc.rating, doc.ratingUsersCount, doc._id.toString());
      // console.log(kk);
      // doc.ratingUsersCount = ratingUsersCount;
      // doc.sortRatingAndRatingUsersCount = kk;

      // Deleting field (make sure field is not defined in schema)
      // doc.set('sortRatingAndRatingUsersCount', undefined, { strict: false });

      const sortSafeWeightedRating = getSortSafeWeightedRatingOfMovie(doc.rating, doc.ratingUsersCount);
      const kk = `${sortSafeWeightedRating}_${doc._id.toString()}`;
      // console.log('kk?', kk);
      doc.sortRatingAndRatingUsersCount = kk;
      await doc.save();

      // return;
      // return doc;
      // sum += doc.rating;
      // numOfItems += 1;
      // console.log('sum?', sum);
    }
    // const avg = (sum / numOfItems).toFixed(2);
    // console.log('sum?', sum);
    // console.log('numOfItems?', numOfItems);
    // console.log('avg?', avg);
  }
}
