import {
  Controller, Param, Get, ValidationPipe, HttpException, HttpStatus, Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { pick } from '../utils/object-utils';
import { relativeToFullImagePath } from '../utils/image-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { FindAllMoviesDto } from './dto/find-all-movies.dto';
import { ValidateMovieDbIdDto } from './dto/movie-db-id.dto';
import { ReleaseYearDto } from './dto/release.year.dto';
import { SortNameQueryDto } from './dto/sort.name.query.dto';
import { ValidateMovieIdDto } from './dto/vaidate.movies.id.dto';
import { MoviesService } from './providers/movies.service';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private configService: ConfigService,
  ) { }

  @Get('firstBySortName')
  async findFirstBySortName(@Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: SortNameQueryDto) {
    const firstBySortNameMovieDetails = await this.moviesService.findFirstBySortName(query.startsWith, true);
    if (!firstBySortNameMovieDetails) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    return pick(firstBySortNameMovieDetails, ['_id', 'name', 'logo', 'releaseDate', 'rating']);
  }

  @Get('firstByReleaseYear')
  async findFirstByReleaseYear(@Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: ReleaseYearDto) {
    const releaseYearMovieData = await this.moviesService.findFirstByReleaseYear(query.year, true);
    if (!releaseYearMovieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    return pick(releaseYearMovieData, ['_id', 'name', 'logo', 'releaseDate', 'rating']);
  }

  @Get(':id')
  async findOne(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto) {
    const movieData = await this.moviesService.findById(params.id, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    if (movieData.logo === null) {
      movieData.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }
    return pick(movieData, ['movieDBId']);
  }

  @Get()
  async findAll(@Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: FindAllMoviesDto) {
    const movies = await this.moviesService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
    );
    if (!movies) {
      throw new HttpException('No movies found', HttpStatus.NOT_FOUND);
    }
    movies.forEach((movie) => {
      if (movie.logo?.length > 1) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = `https://image.tmdb.org/t/p/w220_and_h330_face${movie.logo}`;
      }
      if (movie.logo === null) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
      }
    });
    return movies.map(
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating']),
    );
  }

  @Get('movieDbData/:movieDBId')
  async fetchMovieDbData(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieDbIdDto) {
    const movieDbData = await this.moviesService.fetchMovieDbData(params.movieDBId);
    if (!movieDbData) {
      throw new HttpException('MovieDB movie not found', HttpStatus.NOT_FOUND);
    }
    const expectedCastValues = [];
    movieDbData.cast.map((data) => expectedCastValues.push({
      profile_path: data.profile_path,
      character: data.character,
      name: data.name,
    }));

    const expectedVideosValues = [];
    (movieDbData.video as any).map((data) => expectedVideosValues.push({
        key: data.key,
      }));

    return {
      cast: expectedCastValues,
      video: expectedVideosValues,
      mainData: {
        overview: movieDbData.mainData.overview,
        poster_path: movieDbData.mainData.poster_path,
        release_dates: (movieDbData.mainData as any).release_dates,
        runtime: movieDbData.mainData.runtime,
        title: movieDbData.mainData.title,
        original_title: movieDbData.mainData.original_title,
        production_countries: movieDbData.mainData.production_countries,
      },
    };
  }
}
