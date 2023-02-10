import {
 Controller, Get, HttpException, HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BooksService } from './providers/books.service';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private configService: ConfigService,
  ) {}

  @Get()
  async findAll() {
    const books = await this.booksService.findAll();
    if (!books) {
      throw new HttpException('No books found', HttpStatus.NOT_FOUND);
    }
    return books;
  }
}
