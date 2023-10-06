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
      const searchQuery = 'subject%3Ahorror'; // subject:horror
      const fields = 'key,author_name,cover_edition_key'; // Helps in fetching unnecessary data from the API.
      const { data } = await lastValueFrom(
        this.httpService.get<any>(
          `https://openlibrary.org/search.json?q=${searchQuery}&mode=everything&limit=${limit}&offset=${offset}&fields=${fields}`,
        ),
      );

      if (data?.docs?.length) {
        arr.push(...data.docs);
        offset += limit;
      } else {
        hasMoreData = false;
      }
    }
    return arr;
  }

  async syncWithTheBookDb(): Promise<ReturnBookDb> {
    try {
      const searchBooksData: any = await this.getBookData();
      const mainBookArray: Array<Partial<BookDocument>> = [];
      for (let i = 0; i < searchBooksData.length; i += 1) {
        const bookDataObject: Partial<BookDocument> = {};
        const [keyData, editionKeyData]: any = await Promise.all([
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/${searchBooksData[i].key}.json`),
          ),
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/works/${searchBooksData[i].cover_edition_key}.json`),
          ),
        ]);
        // From `searchBooksData` API
        bookDataObject.bookId = searchBooksData[i].key;
        bookDataObject.coverEditionKey = searchBooksData[i].cover_edition_key;
        bookDataObject.author = searchBooksData[i]?.author_name ?? [];
        // From `keyData` API
        bookDataObject.description = keyData.data?.description?.value ?? keyData.data?.description;
        bookDataObject.covers = keyData.data.covers;
        // From `editionKeyData` API
        bookDataObject.name = editionKeyData.data.title;
        bookDataObject.numberOfPages = editionKeyData.data.number_of_pages;
        bookDataObject.publishDate = editionKeyData.data.publish_date;
        bookDataObject.isbnNumber = [];
        if (editionKeyData.data.isbn_13) {
          bookDataObject.isbnNumber.push(...editionKeyData.data.isbn_13);
        }
        if (editionKeyData.data.isbn_10) {
          bookDataObject.isbnNumber.push(...editionKeyData.data.isbn_10);
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
