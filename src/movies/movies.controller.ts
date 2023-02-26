/* eslint-disable max-len */
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
    const movieData = await this.moviesService.findById(params.id, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    const user = getUserFromRequest(request);
    const movieUserStatus = await this.moviesService.getUserMovieStatusRatings(params.id, user.id);
    if (movieData.logo === null) {
      movieData.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }
    return pick({
      ...movieData.toObject(),
      userData: movieUserStatus,
    }, ['movieDBId', 'rating', 'goreFactorRating', 'worthWatching', 'userData']);
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
    return pick(movieUserStatus, [
      '_id', 'buy', 'createdAt', 'deleted', 'favourite', 'goreFactorRating', 'movieId',
      'name', 'rating', 'ratingStatus', 'status', 'updatedAt', 'userId', 'watch',
      'watched', 'worthWatching',
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
    const movieUserStatus = await this.moviesService.createOrUpdateGoreFactorRating(params.id, createOrUpdateGoreFactorRatingDto.goreFactorRating, user.id);
    return pick(movieUserStatus, [
      '_id', 'buy', 'createdAt', 'deleted', 'favourite', 'goreFactorRating', 'movieId',
      'name', 'rating', 'ratingStatus', 'status', 'updatedAt', 'userId', 'watch',
      'watched', 'worthWatching',
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
    const movieUserStatus = await this.moviesService.createOrUpdateWorthWatching(params.id, createOrUpdateWorthWatchingDto.worthWatching, user.id);
    return pick(movieUserStatus, [
      '_id', 'buy', 'createdAt', 'deleted', 'favourite', 'goreFactorRating', 'movieId',
      'name', 'rating', 'ratingStatus', 'status', 'updatedAt', 'userId', 'watch',
      'watched', 'worthWatching',
    ]);
  }

  @Delete(':id/rating')
  async deleteRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    this.moviesService.createOrUpdateRating(params.id, 0, user.id);
    return { success: true };
  }

  @Delete(':id/gore-factor')
  async deleteGoreFactorRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    this.moviesService.createOrUpdateGoreFactorRating(params.id, 0, user.id);
    return { success: true };
  }

  @Delete(':id/worth-watching')
  async deleteWorthWatching(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto,
  ) {
    await this.movieShouldExist(params.id);
    const user = getUserFromRequest(request);
    this.moviesService.createOrUpdateWorthWatching(params.id, 0, user.id);
    return { success: true };
  }
}
