/* eslint-disable max-lines */
import {
  Controller, Param, Get, ValidationPipe, HttpException, HttpStatus, Query, Req,
  Body, Put, Delete, Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import mongoose from 'mongoose';
import { TransformImageUrls } from 'src/app/decorators/transform-image-urls.decorator';
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
import { MovieUserStatusService } from '../movie-user-status/providers/movie-user-status.service';
import { MovieUserStatusIdDto } from '../movie-user-status/dto/movie-user-status-id.dto';
import { MovieUserStatus } from '../schemas/movieUserStatus/movieUserStatus.schema';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { RecentlyAddedMoviesDto } from './dto/recently-added-movies.dto';
import { BlockRecentMovieDto } from './dto/block-recent-movie.dto';

@Controller({ path: 'movies', version: ['1'] })
export class MoviesController {
  async movieShouldExist(movieId: string) {
    const movieData = await this.moviesService.findById(movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
  }

  constructor(
    private feedPostsService: FeedPostsService,
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
    if (movie.logo === null) {
      movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }

    let reviewPostId;
    const post = await this.feedPostsService.findMovieReviewPost(user.id, movie._id.toString());
    if (post) {
      reviewPostId = { reviewPostId: post.id };
    }
    type UserData = Partial<MovieUserStatus>;
    // assign default values for simplistic usage in client side
    let userData: UserData = {
      rating: 0, goreFactorRating: 0, worthWatching: 0, ...reviewPostId,
    };

    let movieUserStatus: any = await this.moviesService.getUserMovieStatusRatings(params.id, user.id);
    if (movieUserStatus) {
      movieUserStatus = pick(movieUserStatus, ['rating', 'goreFactorRating', 'worthWatching']);
      userData = { ...userData, ...movieUserStatus };
    }

    return pick({
      ...movie,
      // Intentionally overriding value of `ratingUsersCount` of `movie` by coputing on every request because of old-api.
      ratingUsersCount,
      userData,
    }, [
      '_id', 'movieDBId', 'rating', 'ratingUsersCount', 'goreFactorRating', 'goreFactorRatingUsersCount',
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData', 'type', 'movieImage',
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
      null,
      query.startsWith,
      query.type,
    );
    if (!movies) {
      throw new HttpException('No movies found', HttpStatus.NOT_FOUND);
    }
    movies.forEach((movie) => {
      if (movie.type === 2) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, movie.movieImage);
        return;
      }
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching', 'movieImage', 'type']),
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

  @TransformImageUrls('$.mainData.poster_path', '$.cast[*].profile_path')
  @Get('userDefinedMovieData/:id')
  async fetchUserDefinedMovieData(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateMovieIdDto) {
    const movieData = await this.moviesService.fetchUserDefinedMovieData(params.id);
    if (!movieData) {
      throw new HttpException('User defined Movie movie not found', HttpStatus.NOT_FOUND);
    }

    return movieData;
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

  @Get(':movieId/lists')
  async findMovieUserStatus(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieUserStatusData = await this.movieUserStatusService.findMovieUserStatus(user.id, params.movieId);
    if (!movieUserStatusData) {
      return {
        favorite: 0,
        watch: 0,
        watched: 0,
        buy: 0,
      };
    }
    return {
      favorite: movieUserStatusData.favourite,
      watch: movieUserStatusData.watch,
      watched: movieUserStatusData.watched,
      buy: movieUserStatusData.buy,
    };
  }

  @Post(':movieId/lists/favorite')
  async addMovieUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await Promise.all([
      this.movieUserStatusService.addMovieUserStatusFavorite(user.id, params.movieId),
      this.moviesService.createRecentMovieBlock(user.id, params.movieId),
    ]);
    return { success: true };
  }

  @Delete(':movieId/lists/favorite')
  async deleteMovieUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusFavorite(user.id, params.movieId);
    return { success: true };
  }

  @Post(':movieId/lists/watch')
  async addMovieUserStatusWatch(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await Promise.all([this.movieUserStatusService.addMovieUserStatusWatch(user.id, params.movieId),
    this.moviesService.createRecentMovieBlock(user.id, params.movieId)]);
    return { success: true };
  }

  @Delete(':movieId/lists/watch')
  async deleteMovieUserStatusWatch(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusWatch(user.id, params.movieId);
    return { success: true };
  }

  @Post(':movieId/lists/watched')
  async addMovieUserStatusWatched(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await Promise.all([
      this.movieUserStatusService.addMovieUserStatusWatched(user.id, params.movieId),
      this.moviesService.createRecentMovieBlock(user.id, params.movieId),
    ]);
    return { success: true };
  }

  @Delete(':movieId/lists/watched')
  async deleteMovieUserStatusWatched(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusWatched(user.id, params.movieId);
    return { success: true };
  }

  @Post(':movieId/lists/buy')
  async addMovieUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await Promise.all([
      this.movieUserStatusService.addMovieUserStatusBuy(user.id, params.movieId),
      this.moviesService.createRecentMovieBlock(user.id, params.movieId),
    ]);
    return { success: true };
  }

  @Delete(':movieId/lists/buy')
  async deleteMovieUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    await this.movieUserStatusService.deleteMovieUserStatusBuy(user.id, params.movieId);
    return { success: true };
  }

  @Get('recently/added')
  async recentlyAdded(@Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: RecentlyAddedMoviesDto) {
    const movies = await this.moviesService.recentlyAdded(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      null,
      query.startsWith,
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @Post('recent/block')
  async blockRecentlyAddedMovie(
    @Req() request: Request,
    @Body() blockRecentMovieDto: BlockRecentMovieDto,
  ) {
    const user = getUserFromRequest(request);
    await this.moviesService.createRecentMovieBlock(user.id, blockRecentMovieDto.movieId);
    return { success: true };
  }
}
