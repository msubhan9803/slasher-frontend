import {
  Controller, Param, Get, ValidationPipe, HttpException, HttpStatus, Query, Req, Body, Put, Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
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
import { getUserFromRequest } from '../utils/request-utils';
import { CreateOrUpdateRatingDto } from './dto/create-or-update-rating-dto';
import { CreateOrUpdateGoreFactorRatingDto } from './dto/create-or-update-gore-factor-rating-dto';
import { CreateOrUpdateWorthWatchingDto } from './dto/create-or-update-worth-watching-dto';

@Controller({ path: 'movies', version: ['1'] })
export class MoviesController {
  async movieShouldExist(movieId: string) {
    const movieData = await this.moviesService.findById(movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
  }

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
  async findOne(@Req() request: Request, @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto) {
    const movie = await this.moviesService.findById(params.id, true);
    if (!movie) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    // TODO: For now, we are always counting the number of users who have previously rated this movie.
    // This is because the old API app does not update this count.  Once the old API is retired, we
    // can instead just use the movie.ratingUsersCount field.
    const ratingUsersCount = await this.moviesService.getRatingUsersCount(movie._id.toString());

    const user = getUserFromRequest(request);
    const movieUserStatus = await this.moviesService.getUserMovieStatusRatings(params.id, user.id);
    if (movie.logo === null) {
      movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }
    const filterUserData = pick(movieUserStatus, ['rating', 'goreFactorRating', 'worthWatching']);

    return pick({
      ...movie,
      // Intentionally overriding value of `ratingUsersCount` of `movie` by coputing on every request because of old-api.
      ratingUsersCount,
      userData: filterUserData,
    }, [
      'movieDBId', 'rating', 'ratingUsersCount', 'goreFactorRating', 'goreFactorRatingUsersCount',
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
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
    return movieDbData;
  }

  @Put(':id/rating')
  async createOrUpdateRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
    @Body() createOrUpdateRatingDto: CreateOrUpdateRatingDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    const movieUserStatus = await this.moviesService.createOrUpdateRating(params.id, createOrUpdateRatingDto.rating, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['rating']) };
    return pick(filterUserData, [
      'rating', 'ratingUsersCount', 'userData',
    ]);
  }

  @Put(':id/gore-factor')
  async createOrUpdateGoreFactorRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
    @Body() createOrUpdateGoreFactorRatingDto: CreateOrUpdateGoreFactorRatingDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const movieUserStatus = await this.moviesService.createOrUpdateGoreFactorRating(params.id, createOrUpdateGoreFactorRatingDto.goreFactorRating, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['goreFactorRating']) };
    return pick(filterUserData, [
      'goreFactorRating', 'goreFactorRatingUsersCount', 'userData',
    ]);
  }

  @Put(':id/worth-watching')
  async createOrUpdateWorthWatching(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
    @Body() createOrUpdateWorthWatchingDto: CreateOrUpdateWorthWatchingDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const movieUserStatus = await this.moviesService.createOrUpdateWorthWatching(params.id, createOrUpdateWorthWatchingDto.worthWatching, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['worthWatching']) };
    return pick(filterUserData, [
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
  }

  @Delete(':id/rating')
  async deleteRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    const movieUserStatus = await this.moviesService.createOrUpdateRating(params.id, 0, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['rating']) };
    return pick(filterUserData, [
      'rating', 'ratingUsersCount', 'userData',
    ]);
  }

  @Delete(':id/gore-factor')
  async deleteGoreFactorRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    const movieUserStatus = await this.moviesService.createOrUpdateGoreFactorRating(params.id, 0, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['goreFactorRating']) };
    return pick(filterUserData, [
      'goreFactorRating', 'goreFactorRatingUsersCount', 'userData',
    ]);
  }

  @Delete(':id/worth-watching')
  async deleteWorthWatching(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const movieUserStatus = await this.moviesService.createOrUpdateWorthWatching(params.id, 0, user.id);
    const filterUserData = { ...movieUserStatus, userData: pick(movieUserStatus.userData, ['worthWatching']) };
    return pick(filterUserData, [
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
  }
}
