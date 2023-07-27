import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ReturnBookDb } from 'src/movies/dto/cron-job-response.dto';
import { lastValueFrom } from 'rxjs';
import { BookStatus, BookDeletionState } from '../../schemas/book/book.enums';
import { Book, BookDocument } from '../../schemas/book/book.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private booksModel: Model<BookDocument>,
    private httpService: HttpService,
  ) { }

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

  async getBookData(): Promise<any> {
    const arr: any = [];
    let offset = 0;
    const limit = 1000;
    let hasMoreData = true;

    while (hasMoreData) {
      const { data } = await lastValueFrom(
        this.httpService.get<any>(`https://openlibrary.org/subjects/horror.json?limit=${limit}&offset=${offset}`),
      );

      if (data && data.works && data.works.length > 0) {
        arr.push(...data.works);
        offset += limit;
      } else {
        hasMoreData = false;
      }
    }
    return arr;
  }

  async syncWithTheBookDb(): Promise<ReturnBookDb> {
    try {
      const mainBookData: any = await this.getBookData();
      const mainBookArray: any = [];
      for (let i = 0; i < mainBookData.length; i += 1) {
        const bookDataObject: any = {};
        const [keyData, editionKeyData]: any = await Promise.all([
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/${mainBookData[i].key}.json`),
          ),
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/works/${mainBookData[i].cover_edition_key}.json`),
          ),
        ]);
        bookDataObject.description = keyData.data.description?.value ? keyData.data.description.value : keyData.data.description;
        bookDataObject.covers = keyData.data.covers;
        bookDataObject.name = editionKeyData.data.title;
        if (keyData.data?.authors && keyData.data?.authors.length) {
          bookDataObject.author = (keyData.data?.authors).map((author) => author.author.key);
        }
        bookDataObject.numberOfPages = editionKeyData.data.number_of_pages;
        bookDataObject.publishDate = editionKeyData.data.publish_date;
        bookDataObject.coverEditionKey = mainBookData[i].cover_edition_key;
        bookDataObject.bookId = mainBookData[i].key;

        bookDataObject.isbnNumber = {};
        const isbnRegex = new RegExp('isbn[_0-9]');
        const allBookDataKeys = Object.keys(editionKeyData.data);

        for (let num = 0; num < allBookDataKeys.length; num += 1) {
          if (allBookDataKeys[num].match(isbnRegex)) {
            bookDataObject.isbnNumber[allBookDataKeys[num]] = editionKeyData.data[allBookDataKeys[num]];
          }
        }
        mainBookArray.push(bookDataObject);
      }
      await this.booksModel.insertMany(mainBookArray);
      return {
        success: true,
        message: 'Successfully completed the cron job',
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
