import {
  Controller, Param, Get, ValidationPipe, HttpException, HttpStatus, Query, Req, Post, Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { relativeToFullImagePath } from '../utils/image-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { FindAllMoviesDto } from './dto/find-all-movies.dto';
import { ValidateMovieDbIdDto } from './dto/movie-db-id.dto';
import { ReleaseYearDto } from './dto/release.year.dto';
import { SortNameQueryDto } from './dto/sort.name.query.dto';
import { ValidateMovieIdDto } from './dto/vaidate.movies.id.dto';
import { MoviesService } from './providers/movies.service';
import { MovieUserStatusService } from '../movieUserStatus/providers/movie-user-status.service';
import { getUserFromRequest } from '../utils/request-utils';
import { MovieUserStatusIdDto } from '../movieUserStatus/dto/movie-user-status-id.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly movieUserStatusService: MovieUserStatusService,
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
    return movieDbData;
  }

  @Get(':movieId/lists')
  async findAllMovieUserStatus(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findAllMovieUserStatus(user.id, params.movieId);
    if (!movieUserStatusData) {
      return {
        favorite: 0,
        watch: 0,
        watched: 0,
        buy: 0
      }
    }
    return {
      favorite: movieUserStatusData.favourite,
      watch: movieUserStatusData.watch,
      watched: movieUserStatusData.watched,
      buy: movieUserStatusData.buy
    }
  }

  @Post(':movieId/lists/favorite')
  async addMovieUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.addMovieUserStatusFavorite(user.id, params.movieId);
    return { success: true }
  }

  @Delete(':movieId/lists/favorite')
  async deleteMovieUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusFavorite(user.id, params.movieId);
    return { success: true }
  }

  @Post(':movieId/lists/watch')
  async addMovieUserStatusWatch(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.addMovieUserStatusWatch(user.id, params.movieId);
    return { success: true }
  }

  @Delete(':movieId/lists/watch')
  async deleteMovieUserStatusWatch(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusWatch(user.id, params.movieId);
    return { success: true }
  }

  @Post(':movieId/lists/watched')
  async addMovieUserStatusWatched(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.addMovieUserStatusWatched(user.id, params.movieId);
    return { success: true }
  }

  @Delete(':movieId/lists/watched')
  async deleteMovieUserStatusWatched(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusWatched(user.id, params.movieId);
    return { success: true }
  }

  @Post(':movieId/lists/buy')
  async addMovieUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.addMovieUserStatusBuy(user.id, params.movieId);
    return { success: true }
  }

  @Delete(':movieId/lists/buy')
  async deleteMovieUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findByMovieId(params.movieId);
    if (!movieUserStatusData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusBuy(user.id, params.movieId);
    return { success: true }
  }

}
