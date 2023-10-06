import {
  Controller, Get, HttpException, HttpStatus, Param, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { BooksService } from './providers/books.service';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateBookIdDto } from './dto/vaidate.books.id.dto';

@Controller({ path: 'books', version: ['1'] })
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ! NOTE TO SAHIL: We want to use Large image because it is around 30kb size only.
  // Documentation: https://openlibrary.org/dev/docs/api/covers
  // ? NOTE: No need to save urls like below in backend rather construct these in frontend only.
  // https://covers.openlibrary.org/b/ID/2808629-L.jpg (we want to prefer loading this image in fontend)
  // https://covers.openlibrary.org/b/ID/2808629-M.jpg
  // https://covers.openlibrary.org/b/ID/2808629-S.jpg

  @Get()
  async index() {
    const books = await this.booksService.findAll(true);
    return books.map((bookData) => pick(
      bookData,
      ['_id', 'name', 'author', 'description', 'numberOfPages', 'isbnNumber', 'publishDate'],
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
    // const ratingUsersCount = await this.moviesService.getRatingUsersCount(book._id.toString());

    // const user = getUserFromRequest(request);
    // if (book.logo === null) {
    //   book.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
    // }

    // let reviewPostId;
    // const post = await this.feedPostsService.findMovieReviewPost(user.id, book._id.toString());
    // if (post) {
    //   reviewPostId = { reviewPostId: post.id };
    // }
    // type UserData = Partial<MovieUserStatus>;
    // // assign default values for simplistic usage in client side
    // let userData: UserData = {
    //   rating: 0, goreFactorRating: 0, worthWatching: 0, ...reviewPostId,
    // };

    // let movieUserStatus: any = await this.moviesService.getUserMovieStatusRatings(params.id, user.id);
    // if (movieUserStatus) {
    //   movieUserStatus = pick(movieUserStatus, ['rating', 'goreFactorRating', 'worthWatching']);
    //   userData = { ...userData, ...movieUserStatus };
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
}
