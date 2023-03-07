import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from '../../schemas/book/book.schema';
import { BookStatus, BookDeletionState } from '../../schemas/book/book.enums';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private booksModel: Model<BookDocument>,
  ) {}

  async create(bookData: Partial<Book>): Promise<BookDocument> {
    return this.booksModel.create(bookData);
  }

  async findAll(activeOnly: boolean): Promise<BookDocument[]> {
    const booksFindAllQuery: any = {};

    if (activeOnly) {
      booksFindAllQuery.deleted = BookDeletionState.NotDeleted;
      booksFindAllQuery.status = BookStatus.Active;
    }
    return this.booksModel
      .find(booksFindAllQuery)
      .select('name')
      .sort({
        name: 1,
      })
      .exec();
  }
}
