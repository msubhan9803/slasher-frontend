/* eslint-disable max-lines */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';

import { MovieActiveStatus, MovieDeletionStatus, MovieType } from '../../schemas/movie/movie.enums';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { DiscoverMovieMapper } from '../mapper/discover-movie.mapper';
import { MovieDbDto } from '../dto/movie-db.dto';
import { ReturnMovieDb } from '../dto/cron-job-response.dto';
import { DiscoverMovieDto } from '../dto/discover-movie.dto';
import { relativeToFullImagePath } from '../../utils/image-utils';

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
    const movieFindAllQuery: any = {
      type: MovieType.MovieDb,
    };
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
    let moviesFromMovieDB = [];

    // Fetch the movies from collection based on yearly data
    const databaseMovies = await this.moviesModel.find(({ releaseDate: { $lte: new Date(endDate), $gte: new Date(startDate) } })).exec();
    do {
      const movieData: MovieDbDto | null = await this.fetchMovieDataAPI(startDate, endDate, options.page);
      if (movieData) {
        options.total_pages = movieData.total_pages;
        options.page = movieData.page + 1;

        moviesFromMovieDB = [...moviesFromMovieDB, ...movieData.results];
        await this.processDatabaseOperation(movieData.results, databaseMovies);
      }
    } while (options.page <= options.total_pages);

    const databaseMovieKeys = databaseMovies.map(({ movieDBId }) => movieDBId);

    // Mark the deleted record on field deleted
    const deletedRecordKeys = [];
    for (const movieId of databaseMovieKeys) {
      const existing = moviesFromMovieDB.find(({ id }) => id === movieId);
      if (!existing) {
        deletedRecordKeys.push(movieId);
      }
    }

    await this.moviesModel.updateMany(({ movieDBId: { $in: deletedRecordKeys } }), { $set: { deleted: MovieDeletionStatus.Deleted } });
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
    databaseMovies,
  ): Promise<void> {
    if (!movies && movies.length) {
      return;
    }

    const insertedMovieList = [];

    const databaseMovieKeys = databaseMovies.map(({ movieDBId }) => movieDBId);
    const promisesArray = [];
    for (const movie of movies) {
      if (databaseMovieKeys.includes(movie.id)) {
        const movieData = await this.moviesModel.findOne({ movieDBId: movie.id });
        if (movieData) {
          for (const movieKey of Object.keys(DiscoverMovieMapper.toDomain(movie))) {
            movie[movieKey] = DiscoverMovieMapper.toDomain(movie)[movieKey];
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

      return false;
    });

    return {
      cast,
      video: videoData.data.results,
      mainData,
    };
  }
}
