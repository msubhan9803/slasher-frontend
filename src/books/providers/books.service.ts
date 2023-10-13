import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ReturnBookDb } from 'src/movies/dto/cron-job-response.dto';
import { lastValueFrom } from 'rxjs';
import { BookStatus, BookDeletionState } from '../../schemas/book/book.enums';
import { Book, BookDocument } from '../../schemas/book/book.schema';
import { isDevelopmentServer } from '../../constants';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import { WorthWatchingStatus } from '../../types';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private booksModel: Model<BookDocument>,
    @InjectModel(BookUserStatus.name) private bookUserStatusModel: Model<BookUserStatusDocument>,
    private httpService: HttpService,
  ) { }

  async create(bookData: Partial<Book>): Promise<BookDocument> {
    return this.booksModel.create(bookData);
  }

  async findById(id: string, activeOnly: boolean): Promise<Book> {
    const booksFindQuery: any = { _id: id };
    if (activeOnly) {
      booksFindQuery.deleted = BookDeletionState.NotDeleted;
      booksFindQuery.status = BookStatus.Active;
    }
    const bookData = await this.booksModel.findOne(booksFindQuery).exec();
    return bookData ? bookData.toObject() : null;
  }

  async createOrUpdateRating(bookId: string, rating: number, userId: string) {
    // Create/update a BookUserStatus document
    const bookUserStatus = await this.bookUserStatusModel.findOneAndUpdate(
      { bookId, userId },
      { $set: { rating } },
      { upsert: true, new: true },
    );
    // Calculate average of all `bookUserStatuses` documents for a given `bookId` (ignore 0 rating)
    const aggregate = await this.bookUserStatusModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId), rating: { $exists: true, $ne: 0 } } },
      { $group: { _id: 'bookId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Book> = { rating: 0, ratingUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageRating, count }] = aggregate;
      update.rating = averageRating.toFixed(1);
      update.ratingUsersCount = count;
    }
    // Update properties related to `rating`
    const book = (await this.booksModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(bookId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...book, userData: bookUserStatus };
  }

  async createOrUpdateGoreFactorRating(bookId: string, goreFactorRating: number, userId: string) {
    // Create/update a BookUserStatus document
    const bookUserStatus = await this.bookUserStatusModel.findOneAndUpdate(
      { bookId, userId },
      { $set: { goreFactorRating } },
      { upsert: true, new: true },
    );
    // Calculate average of all `bookUserStatuses` documents for a given `bookId` (ignore 0 goreFactorRating)
    const aggregate = await this.bookUserStatusModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId), goreFactorRating: { $exists: true, $ne: 0 } } },
      { $group: { _id: 'bookId', averageGoreFactorRating: { $avg: '$goreFactorRating' }, count: { $sum: 1 } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Book> = { goreFactorRating: 0, goreFactorRatingUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageGoreFactorRating, count }] = aggregate;
      update.goreFactorRating = averageGoreFactorRating.toFixed(1);
      update.goreFactorRatingUsersCount = count;
    }
    // Update properties related to `goreFactorRating`
    const book = (await this.booksModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(bookId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...book, userData: bookUserStatus };
  }

  async getUserBookStatusRatings(bookId: string, userId: string) {
    const bookUserStatus = await this.bookUserStatusModel.findOne({ bookId, userId }).select({
      rating: 1, goreFactorRating: 1, worthWatching: 1,
    });
    return bookUserStatus;
  }

  async createOrUpdateWorthWatching(bookId: string, worthWatching: number, userId: string) {
    // Create/update a BookUserStatus document
    const bookUserStatus = await this.bookUserStatusModel.findOneAndUpdate(
      { bookId, userId },
      { $set: { worthWatching } },
      { upsert: true, new: true },
    );
    // Calculate average of all `bookUserStatuses` documents for a given `bookId` (ignore 0 goreFactorRating)
    const aggregate = await this.bookUserStatusModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId), worthWatching: { $exists: true, $ne: WorthWatchingStatus.NoRating } } },
      { $group: { _id: 'bookId', averageWorthWatching: { $avg: '$worthWatching' } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Book> = { worthWatching: 0, worthWatchingUpUsersCount: 0, worthWatchingDownUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageWorthWatching }] = aggregate;
      update.worthWatching = Math.round(averageWorthWatching);
      update.worthWatchingUpUsersCount = await this.bookUserStatusModel.count({ bookId, worthWatching: { $eq: WorthWatchingStatus.Up } });
      update.worthWatchingDownUsersCount = await this.bookUserStatusModel.count({
        bookId,
        worthWatching: { $eq: WorthWatchingStatus.Down },
      });
    }
    // Update properties related to `worthWatch`
    const book = (await this.booksModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(bookId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...book, userData: bookUserStatus };
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
    // TODO: Remove `isDevelopmentServer` usage
    const limit = isDevelopmentServer ? 50 : 1000; // ! FOR production we value =1000
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
        // ! FOR PRODUCTION: Remove below line
        if (isDevelopmentServer) {
          hasMoreData = false;
        }
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
        // eslint-disable-next-line no-console
        console.log('i?', i);
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
        // From `editionKeyData` API
        bookDataObject.name = editionKeyData.data.title;
        bookDataObject.covers = editionKeyData.data.covers;
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
