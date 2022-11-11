import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';
import { MovieActiveStatus, MovieDeletionStatus, MovieType } from '../../schemas/movie/movie.enums';
import { escapeStringForRegex } from '../../utils/escape-utils';

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

export interface Result {
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
  crew: Crew[],
  video: Result[],
  mainData: MainData[]
}

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

  async fetchMovieDbData(movieDbId: number): Promise<MovieDbData> {
    const [castAndCrewData, videoData, mainDetails]: any = await Promise.all([
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}/credits?api_key=9c6cbe2e4292ba89cf114184a4f0bebb&language=en-US`,
      )),
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}/videos?api_key=9c6cbe2e4292ba89cf114184a4f0bebb&language=en-US`,
      )),
      lastValueFrom(this.httpService.get<MovieDbData>(
        `https://api.themoviedb.org/3/movie/${movieDbId}?api_key=9c6cbe2e4292ba89cf114184a4f0bebb&language=en-US`,
      )),
    ]);
    mainDetails.data.poster_path = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${mainDetails.data.poster_path}`;
    return {
      cast: castAndCrewData.data.cast, crew: castAndCrewData.data.crew, video: videoData.data.results, mainData: mainDetails.data,
    };
  }
}
