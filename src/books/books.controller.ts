/* eslint-disable max-lines */
import {
  Body,
  Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { pick } from '../utils/object-utils';
import { BooksService } from './providers/books.service';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateBookIdDto } from './dto/validate.books.id.dto';
// Note: We are using same DTO's as of movies's controller to avoid code duplicacy.
import { CreateOrUpdateGoreFactorRatingDto } from '../movies/dto/create-or-update-gore-factor-rating-dto';
import { CreateOrUpdateRatingDto } from '../movies/dto/create-or-update-rating-dto';
import { getUserFromRequest } from '../utils/request-utils';
import { BookUserStatusIdDto } from '../book-user-status/dto/book-user-status-id.dto';
import { BookUserStatusService } from '../book-user-status/providers/book-user-status.service';
import { relativeToFullImagePath } from '../utils/image-utils';
import { BookUserStatus } from '../schemas/bookUserStatus/bookUserStatus.schema';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { CreateOrUpdateWorthReadingDto } from './dto/create-or-update-worth-reading-dto';

@Controller({ path: 'books', version: ['1'] })
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly bookUserStatusService: BookUserStatusService,
    private feedPostsService: FeedPostsService,
    private configService: ConfigService,
  ) { }

  async bookShouldExist(bookId: string) {
    const bookData = await this.booksService.findById(bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async index() {
    const books = await this.booksService.findAll(10, true, 'name');
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
    const ratingUsersCount = await this.booksService.getRatingUsersCount(book._id.toString());

    const user = getUserFromRequest(request);
    if (book.logo === null) {
      book.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    }

    let reviewPostId;
    const post = await this.feedPostsService.findMovieReviewPost(user.id, book._id.toString());
    if (post) {
      reviewPostId = { reviewPostId: post.id };
    }
    type UserData = Partial<BookUserStatus>;
    // assign default values for simplistic usage in client side
    let userData: UserData = {
      rating: 0, goreFactorRating: 0, worthWatching: 0, ...reviewPostId,
    };

    let bookUserStatus: any = await this.booksService.getUserBookStatusRatings(params.id, user.id);
    if (bookUserStatus) {
      bookUserStatus = pick(bookUserStatus, ['rating', 'goreFactorRating', 'worthWatching']);
      userData = { ...userData, ...bookUserStatus };
    }

    const bookRelatedFields = ['publishDate', 'description', 'coverEditionKey', 'bookId',
      'status', 'deleted', 'isbnNumber', 'numberOfPages', 'author', 'name', 'covers'];

    return pick({
      ...book,
      // Intentionally overriding value of `ratingUsersCount` of `movie` by coputing on every request because of old-api.
      ratingUsersCount,
      userData,
    }, [
      ...bookRelatedFields,
      'rating', 'ratingUsersCount', 'goreFactorRating',
      'goreFactorRatingUsersCount', 'worthWatching', 'worthWatchingUpUsersCount', 'worthWatchingDownUsersCount', 'userData',
    ]);
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

  @Put(':id/worth-reading')
  async createOrUpdateWorthReading(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
    @Body() createOrUpdateWorthReadingDto: CreateOrUpdateWorthReadingDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const bookUserStatus = await this.booksService.createOrUpdateWorthReading(params.id, createOrUpdateWorthReadingDto.worthReading, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['worthReading']) };
    return pick(filterUserData, [
      'worthReading', 'worthReadingUpUsersCount', 'worthReadingDownUsersCount', 'userData',
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

  @Delete(':id/worth-reading')
  async deleteWorthReading(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateBookIdDto,
  ) {
    await this.bookShouldExist(params.id);
    const user = getUserFromRequest(request);
    // eslint-disable-next-line max-len
    const bookUserStatus = await this.booksService.createOrUpdateWorthReading(params.id, 0, user.id);
    const filterUserData = { ...bookUserStatus, userData: pick(bookUserStatus.userData, ['worthReading']) };
    return pick(filterUserData, [
      'worthReading', 'worthReadingUpUsersCount', 'worthReadingDownUsersCount', 'userData',
    ]);
  }

  @Get(':bookId/lists')
  async findBookUserStatus(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookUserStatusData = await this.bookUserStatusService.findBookUserStatus(user.id, params.bookId);
    if (!bookUserStatusData) {
      return {
        favorite: 0,
        read: 0,
        readingList: 0,
        buy: 0,
      };
    }
    return {
      favorite: bookUserStatusData.favourite,
      read: bookUserStatusData.read,
      readingList: bookUserStatusData.readingList,
      buy: bookUserStatusData.buy,
    };
  }

  @Post(':bookId/lists/favorite')
  async addBookUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.addBookUserStatusFavorite(user.id, params.bookId);
    return { success: true };
  }

  @Delete(':bookId/lists/favorite')
  async deleteBookUserStatusFavorite(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.deleteBookUserStatusFavorite(user.id, params.bookId);
    return { success: true };
  }

  @Post(':bookId/lists/read')
  async addBookUserStatusRead(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.addBookUserStatusRead(user.id, params.bookId);
    return { success: true };
  }

  @Delete(':bookId/lists/read')
  async deleteBookUserStatusRead(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.deleteBookUserStatusRead(user.id, params.bookId);
    return { success: true };
  }

  @Post(':bookId/lists/readingList')
  async addBookUserStatusReadingList(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.addBookUserStatusReadingList(user.id, params.bookId);
    return { success: true };
  }

  @Delete(':bookId/lists/readingList')
  async deleteBookUserStatusReadingList(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.deleteBookUserStatusReadingList(user.id, params.bookId);
    return { success: true };
  }

  @Post(':bookId/lists/buy')
  async addBookUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.addBookUserStatusBuy(user.id, params.bookId);
    return { success: true };
  }

  @Delete(':bookId/lists/buy')
  async deleteBookUserStatusBuy(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookUserStatusIdDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }
    await this.bookUserStatusService.deleteBookUserStatusBuy(user.id, params.bookId);
    return { success: true };
  }
}
