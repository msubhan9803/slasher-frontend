import {
  Body,
  Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { BooksService } from './providers/books.service';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateBookIdDto } from './dto/validate.books.id.dto';
// Note: We are using same DTO's as of movies's controller to avoid code duplicacy.
import { CreateOrUpdateGoreFactorRatingDto } from '../movies/dto/create-or-update-gore-factor-rating-dto';
import { CreateOrUpdateRatingDto } from '../movies/dto/create-or-update-rating-dto';
import { CreateOrUpdateWorthWatchingDto } from '../movies/dto/create-or-update-worth-watching-dto';
import { getUserFromRequest } from '../utils/request-utils';

@Controller({ path: 'books', version: ['1'] })
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  async bookShouldExist(bookId: string) {
    const bookData = await this.booksService.findById(bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async index() {
    const books = await this.booksService.findAll(true);
    return books.map((bookData) => pick(
      bookData,
      ['_id', 'name', 'author', 'description', 'numberOfPages', 'isbnNumber', 'publishDate', 'covers'],
    ));
  }

  @Get(':id')
  async findOne(@Req() request: Request, @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto) {
    const book = await this.booksService.findById(params.id, true);
    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    // TODO: For now, we are always counting the number of users who have previously rated this movie.
    // This is because the old API app does not update this count.  Once the old API is retired, we
    // can instead just use the movie.ratingUsersCount field.
    // const ratingUsersCount = await this.booksService.getRatingUsersCount(book._id.toString());

    // const user = getUserFromRequest(request);
    // if (book.logo === null) {
    //   book.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    // }

    // let reviewPostId;
    // const post = await this.feedPostsService.findMovieReviewPost(user.id, book._id.toString());
    // if (post) {
    //   reviewPostId = { reviewPostId: post.id };
    // }
    // type UserData = Partial<BookUserStatus>;
    // // assign default values for simplistic usage in client side
    // let userData: UserData = {
    //   rating: 0, goreFactorRating: 0, worthWatching: 0, ...reviewPostId,
    // };

    // let bookUserStatus: any = await this.booksService.getUserMovieStatusRatings(params.id, user.id);
    // if (bookUserStatus) {
    //   bookUserStatus = pick(bookUserStatus, ['rating', 'goreFactorRating', 'worthWatching']);
    //   userData = { ...userData, ...bookUserStatus };
    // }

    return book;
    // ! TODO: Use below code after implementing all the review related features.
    // return pick({
    //   ...book,
    //   // Intentionally overriding value of `ratingUsersCount` of `movie` by coputing on every request because of old-api.
    //   ratingUsersCount,
    //   userData,
    // }, [
    //   'movieDBId', 'rating', 'ratingUsersCount', 'goreFactorRating', 'goreFactorRatingUsersCount',
    //   'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    // ]);
  }

  @Put(':id/rating')
  async createOrUpdateRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
    @Body() createOrUpdateRatingDto: CreateOrUpdateRatingDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    const bookUserStatus = await this.booksService.createOrUpdateRating(params.id, createOrUpdateRatingDto.rating, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['rating']) };
    return pick(filterUserData, [
      'rating', 'ratingUsersCount', 'userData',
    ]);
  }

  @Put(':id/gore-factor')
  async createOrUpdateGoreFactorRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
    @Body() createOrUpdateGoreFactorRatingDto: CreateOrUpdateGoreFactorRatingDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const bookUserStatus = await this.booksService.createOrUpdateGoreFactorRating(params.id, createOrUpdateGoreFactorRatingDto.goreFactorRating, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['goreFactorRating']) };
    return pick(filterUserData, [
      'goreFactorRating', 'goreFactorRatingUsersCount', 'userData',
    ]);
  }

  @Put(':id/worth-watching')
  async createOrUpdateWorthWatching(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
    @Body() createOrUpdateWorthWatchingDto: CreateOrUpdateWorthWatchingDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const bookUserStatus = await this.booksService.createOrUpdateWorthWatching(params.id, createOrUpdateWorthWatchingDto.worthWatching, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['worthWatching']) };
    return pick(filterUserData, [
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
  }

  @Delete(':id/rating')
  async deleteRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    const bookUserStatus = await this.booksService.createOrUpdateRating(params.id, 0, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['rating']) };
    return pick(filterUserData, [
      'rating', 'ratingUsersCount', 'userData',
    ]);
  }

  @Delete(':id/gore-factor')
  async deleteGoreFactorRating(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    const bookUserStatus = await this.booksService.createOrUpdateGoreFactorRating(params.id, 0, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['goreFactorRating']) };
    return pick(filterUserData, [
      'goreFactorRating', 'goreFactorRatingUsersCount', 'userData',
    ]);
  }

  @Delete(':id/worth-watching')
  async deleteWorthWatching(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const bookUserStatus = await this.booksService.createOrUpdateWorthWatching(params.id, 0, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['worthWatching']) };
    return pick(filterUserData, [
      'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
  }
}
