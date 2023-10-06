import { Controller, Get } from '@nestjs/common';
import { pick } from '../utils/object-utils';
import { BooksService } from './providers/books.service';

@Controller({ path: 'books', version: ['1'] })
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async index() {
    const books = await this.booksService.findAll(true);
    return books.map((bookData) => pick(
      bookData,
      ['_id', 'name', 'author', 'description', 'numberOfPages', 'isbnNumber', 'publishDate'],
    ));
  }
}
