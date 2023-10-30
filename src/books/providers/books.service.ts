/* eslint-disable no-console */
/* eslint-disable max-lines */
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ReturnBookDb } from 'src/movies/dto/cron-job-response.dto';
// eslint-disable-next-line import/no-extraneous-dependencies
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { DateTime, Duration } from 'luxon';
import async from 'async';
import { BookActiveStatus, BookDeletionState, BookType } from '../../schemas/book/book.enums';
import { Book, BookDocument } from '../../schemas/book/book.schema';
import { NON_ALPHANUMERIC_REGEX } from '../../constants';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import {
  BookUserStatusBuy, BookUserStatusFavorites, BookUserStatusRead, BookUserStatusReadingList,
} from '../../schemas/bookUserStatus/bookUserStatus.enums';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { BookKeysFromOpenLibrary, BookFromOpenLibrary, WorthReadingStatus } from '../../types';
import { S3StorageService } from '../../local-storage/providers/s3-storage.service';
import { getCoverImageForBookOfOpenLibrary } from '../../utils/text-utils';
import { StorageLocationService } from '../../global/providers/storage-location.service';
import { LocalStorageService } from '../../local-storage/providers/local-storage.service';
import { downloadFileTemporarily } from '../../utils/file-download-utils';
import { buildBook, getCustomBookId } from './books.build';

@Injectable()
export class BooksService {
  private syncStartTime: DateTime;

  constructor(
    @InjectModel(Book.name) private booksModel: Model<BookDocument>,
    @InjectModel(BookUserStatus.name) private bookUserStatusModel: Model<BookUserStatusDocument>,
    private readonly s3StorageService: S3StorageService,
    private httpService: HttpService,
    private readonly config: ConfigService,
    private readonly storageLocationService: StorageLocationService,
    private readonly localStorageService: LocalStorageService,
  ) { }

  async create(bookData: Partial<Book>): Promise<BookDocument> {
    return this.booksModel.create(bookData);
  }

  async findById(id: string, activeOnly: boolean): Promise<Book> {
    const booksFindQuery: any = { _id: id };
    if (activeOnly) {
      booksFindQuery.deleted = BookDeletionState.NotDeleted;
      booksFindQuery.status = BookActiveStatus.Active;
    }
    const bookData = await this.booksModel.findOne(booksFindQuery).exec();
    return bookData ? bookData.toObject() : null;
  }

  // TODO: Write test for this
  async updateBookPostFields(bookPostFields, feedPost) {
    if (bookPostFields.rating) {
      await this.createOrUpdateRating(
        feedPost.bookId.toString(),
        bookPostFields.rating,
        feedPost.userId,
      );
    }
    if (bookPostFields.goreFactorRating) {
      await this.createOrUpdateGoreFactorRating(
        feedPost.bookId.toString(),
        bookPostFields.goreFactorRating,
        feedPost.userId,
      );
    }
    if (typeof bookPostFields.worthReading === 'number') {
      await this.createOrUpdateWorthReading(
        feedPost.bookId.toString(),
        bookPostFields.worthReading,
        feedPost.userId,
      );
    }
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
      rating: 1, goreFactorRating: 1, worthReading: 1,
    });
    return bookUserStatus;
  }

  async createOrUpdateWorthReading(bookId: string, worthReading: number, userId: string) {
    // Create/update a BookUserStatus document
    const bookUserStatus = await this.bookUserStatusModel.findOneAndUpdate(
      { bookId, userId },
      { $set: { worthReading } },
      { upsert: true, new: true },
    );
    // Calculate average of all `bookUserStatuses` documents for a given `bookId` (ignore 0 goreFactorRating)
    const aggregate = await this.bookUserStatusModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId), worthReading: { $exists: true, $ne: WorthReadingStatus.NoRating } } },
      { $group: { _id: 'bookId', averageWorthReading: { $avg: '$worthReading' } } },
    ]);

    // assign default values for simplistic usage in client side and document update
    const update: Partial<Book> = { worthReading: 0, worthReadingUpUsersCount: 0, worthReadingDownUsersCount: 0 };
    if (aggregate.length !== 0) {
      const [{ averageWorthReading }] = aggregate;
      update.worthReading = Math.round(averageWorthReading);
      update.worthReadingUpUsersCount = await this.bookUserStatusModel.count({ bookId, worthReading: { $eq: WorthReadingStatus.Up } });
      update.worthReadingDownUsersCount = await this.bookUserStatusModel.count({
        bookId,
        worthReading: { $eq: WorthReadingStatus.Down },
      });
    }
    // Update properties related to `worthRead`
    const book = (await this.booksModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(bookId) },
      { $set: update },
      { new: true },
    )).toObject();

    return { ...book, userData: bookUserStatus };
  }

  async getRatingUsersCount(bookId: string) {
    return this.bookUserStatusModel.count({ bookId, rating: { $exists: true, $ne: 0 } });
  }

  async findAll(
    limit: number,
    activeOnly: boolean,
    sortBy: 'name' | 'publishDate' | 'rating',
    after?: mongoose.Types.ObjectId,
    nameContains?: string,
    bookIdsIn?: mongoose.Types.ObjectId[],
    sortNameStartsWith?: string,
  ): Promise<BookDocument[]> {
    const booksFindAllQuery: any = {
      type: BookType.OpenLibrary,
    };
    if (bookIdsIn) {
      booksFindAllQuery._id = { $in: bookIdsIn };
    }
    if (activeOnly) {
      booksFindAllQuery.deleted = BookDeletionState.NotDeleted;
      booksFindAllQuery.status = BookActiveStatus.Active;
    }
    if (after && sortBy === 'name') {
      const afterBook = await this.booksModel.findById(after);
      booksFindAllQuery.sort_name = { ...booksFindAllQuery.sort_name, $gt: afterBook.sort_name };
    }
    if (after && sortBy === 'publishDate') {
      const afterBook = await this.booksModel.findById(after);
      booksFindAllQuery.sortPublishDate = { $lt: afterBook.sortPublishDate };
    }
    if (after && sortBy === 'rating') {
      const afterBook = await this.booksModel.findById(after);
      booksFindAllQuery.sortRatingAndRatingUsersCount = { $lt: afterBook.sortRatingAndRatingUsersCount };
    }

    if (nameContains) {
      booksFindAllQuery.name = {};
      booksFindAllQuery.name.$regex = new RegExp(escapeStringForRegex(nameContains), 'i');
    }
    if (sortNameStartsWith) {
      let combinedRegex = '';
      if (nameContains) {
        booksFindAllQuery.name.$regex = new RegExp(escapeStringForRegex(nameContains), 'i');
      }
      if (sortNameStartsWith && sortNameStartsWith !== '#') {
        booksFindAllQuery.sort_name = booksFindAllQuery.sort_name || {};
        combinedRegex = `^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`;
        booksFindAllQuery.sort_name.$regex = new RegExp(combinedRegex, 'i');
      } else if (sortNameStartsWith === '#') {
        combinedRegex = NON_ALPHANUMERIC_REGEX.source;
        booksFindAllQuery.name = booksFindAllQuery.name || {};
        booksFindAllQuery.name.$regex = new RegExp(combinedRegex, 'i');
      }
    }

    let sortBooksByNameAndReleaseDate: any;
    if (sortBy === 'name') {
      sortBooksByNameAndReleaseDate = { sort_name: 1 };
    } else if (sortBy === 'publishDate') {
      sortBooksByNameAndReleaseDate = { sortPublishDate: -1 };
    } else {
      sortBooksByNameAndReleaseDate = { sortRatingAndRatingUsersCount: -1 };
    }
    return this.booksModel.find(booksFindAllQuery)
      .sort(sortBooksByNameAndReleaseDate)
      .limit(limit)
      .exec();
  }

  async getFavoriteListBookIdsForUser(userId: string): Promise<Partial<BookUserStatusDocument[]>> {
    const favoriteBookIdByUser = await this.bookUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), favourite: BookUserStatusFavorites.Favorite }, { bookId: 1, _id: 0 })
      .exec();

    const favoriteBookIdArray = favoriteBookIdByUser.map((book) => book.bookId);
    return favoriteBookIdArray as unknown as BookUserStatusDocument[];
  }

  async getBuyListBookIdsForUser(userId: string): Promise<Partial<BookUserStatusDocument[]>> {
    const buyBookIdByUser = await this.bookUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), buy: BookUserStatusBuy.Buy }, { bookId: 1, _id: 0 })
      .exec();
    const buyBookIdArray = buyBookIdByUser.map((book) => book.bookId);
    return buyBookIdArray as unknown as BookUserStatusDocument[];
  }

  async getReadListBookIdsForUser(userId: string): Promise<Partial<BookUserStatusDocument[]>> {
    const readBookIdByUser = await this.bookUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), read: BookUserStatusRead.Read }, { bookId: 1, _id: 0 })
      .exec();
    const readBookIdArray = readBookIdByUser.map((book) => book.bookId);
    return readBookIdArray as unknown as BookUserStatusDocument[];
  }

  async getReadingListBookIdsForUser(userId: string): Promise<Partial<BookUserStatusDocument[]>> {
    const readingBookIdByUser = await this.bookUserStatusModel
      .find({ userId: new mongoose.Types.ObjectId(userId), readingList: BookUserStatusReadingList.ReadingList }, { bookId: 1, _id: 0 })
      .exec();
    const readingBookIdArray = readingBookIdByUser.map((book) => book.bookId);
    return readingBookIdArray as unknown as BookUserStatusDocument[];
  }

  async syncWithOpenLibrary(): Promise<ReturnBookDb> {
    // -- FOR TESTING ONLY ---
    this.syncStartTime = DateTime.now();

    // Note: This might be helpful to remove duplicate books feature in future.
    // From OpenLibrary, we collect ids of all the books
    // (`bookId` + `coverEditionKey`)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const booksFromOpenLibrary = { ids: [] };

    // Fetch `bookId` and `coverEditionKey` to check for already existing books later
    // (`bookId` + `coverEditionKey`)
    const databaseBookKeys: string[] = [];
    for await (
      const doc of this.booksModel
        .find()
        .select('bookId coverEditionKey')
        .cursor()
    ) {
      databaseBookKeys.push(getCustomBookId(doc));
    }

    try {
      // Note; Initial value `offset` is zero i.e, items starting from 1st book.
      // Note: When offset=1, items will be fetched from and including 2nd book.
      let offset = 0; // (default = 0)
      const limit = 50; // 50 // ! FOR production we value =1000
      let hasMoreData = true;

      const LIMIT_TOTAL_ITEMS = 1000; // 500 // ! Should me a multiple of limit

      while (hasMoreData) {
        const searchQuery = 'subject%3Ahorror'; // subject:horror
        const bookFieldKeys: BookKeysFromOpenLibrary = ['author_name', 'cover_edition_key', 'key'];
        const fields = bookFieldKeys.join(','); // Helps in overfetching data issue from API.
        const { data } = await lastValueFrom(
          this.httpService.get<any>(
            `https://openlibrary.org/search.json?q=${searchQuery}&mode=everything&limit=${limit}&offset=${offset}&fields=${fields}`,
          ),
        );
        const limitIsNotReachedYet = offset < LIMIT_TOTAL_ITEMS;
        if (data?.docs?.length && limitIsNotReachedYet) {
          await this.fetchBooksFromOpenLibrary(data?.docs, databaseBookKeys);

          offset += limit;

          // Note to developer: Please ignore below log in testing because in testing we use mockup data which is always fixed.
          console.log('Total books fetched so far?', offset);

          const now = DateTime.now();
          const duration = now.diff(this.syncStartTime);
          console.log('Total time elapsed:', duration.toFormat("h 'hours,' m 'minutes,' s 'seconds'"));

          const timeTaken = (duration.as('seconds') / offset) * data.numFound;
          const estimatedDuration = Duration.fromObject({ seconds: timeTaken });
          console.log('TOTAL Estimated Time:', estimatedDuration.toFormat("h 'hours,' m 'minutes,' s 'seconds'\n"));
        } else {
          hasMoreData = false;
        }
      }

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

  async fetchBooksFromOpenLibrary(
    booksFromOpenLibrary: BookFromOpenLibrary[],
    databaseBookKeys: string[],
  ) {
    const books: Array<Partial<BookDocument>> = [];

    const fetchBookDetails = async (i: number) => {
      // Note: This log is here for initial testing and debugging pupose.
      // eslint-disable-next-line no-console
      console.log(`i=${i}`);
      const [keyDataSettled, editionKeyDataSettled]: any = await Promise.allSettled([
        lastValueFrom(
          this.httpService.get<any>(`https://openlibrary.org/${booksFromOpenLibrary[i].key}.json`),
        ),
        lastValueFrom(
          this.httpService.get<any>(`https://openlibrary.org/works/${booksFromOpenLibrary[i].cover_edition_key}.json`),
        ),
      ]);

      const keyData = (keyDataSettled.status === 'fulfilled') ? keyDataSettled.value : null;
      const editionKeyData = (editionKeyDataSettled.status === 'fulfilled') ? editionKeyDataSettled.value : null;

      const book = buildBook(i, booksFromOpenLibrary, keyData, editionKeyData);
      books.push(book);
    };

    // Note: Concurrency is max number of parallel active async requests, we should keep it low
    // so public API servers do not block our server IPs
    const CONCURRENCY = 7;
    const queue = async.queue(async (i: number) => {
      try {
        await fetchBookDetails(i);
      } catch (error) {
        console.log('Failed to execute request: error=', error);
      }
    }, CONCURRENCY);

    if (process.env.NODE_ENV !== 'test') { console.time('BENCHMARK--1a--book-details-queue'); }
    booksFromOpenLibrary.forEach((_, i) => queue.push(i));
    // Wait for all requests to complete
    await queue.drain();
    if (process.env.NODE_ENV !== 'test') { console.timeEnd('BENCHMARK--1a--book-details-queue'); }

    try {
      await this.processDatabaseOperation(books, databaseBookKeys);
    } catch (error) {
      throw new Error('Failed to run `processDatabaseOperation()`');
    }
  }

  async processDatabaseOperation(
    books: Array<Partial<BookDocument>>,
    databaseBookKeys: string[],
  ): Promise<void> {
    if (!books && books.length) {
      return;
    }

    const insertBookList: Array<Partial<BookDocument>> = [];
    const updateBooksPromisesArray = [];
    for (const book of books) {
      const isValidBook = book.name && book.coverEditionKey;
      if (isValidBook) {
        if (databaseBookKeys.includes(getCustomBookId(book))) {
          // Note: We use both `bookId` and `coverEditionKey` because we prefer `getCustomBookId` to uniquely identify a book elsewhere.
          const bookData = await this.booksModel.findOne({ bookId: book.bookId, coverEditionKey: book.coverEditionKey });
          if (bookData) {
            for (const bookKey of Object.keys(book)) {
              bookData[bookKey] = book[bookKey];
            }
            updateBooksPromisesArray.push(bookData.save());
          }
        } else {
          insertBookList.push(book);
        }
      }
    }

    // Update all existing records
    await Promise.all(updateBooksPromisesArray);

    // Insert all the new movies to collection
    if (insertBookList.length) {
      const handleCoverImageTransferAndUpdateBook = async (book: Partial<BookDocument>) => {
        // Upload `coverImage` to s3 bucket before saving to db
        if (book.coverImageId) {
          const coverImgeUrl = getCoverImageForBookOfOpenLibrary(book.coverImageId);
          const storageLocation = await this.transferRemoteFileToS3Bucket(coverImgeUrl);
          // eslint-disable-next-line no-param-reassign
          book.coverImage = { image_path: storageLocation, description: null };
        }
      };
      // Note: Concurrency is max number of parallel active async requests, we should keep it low
      // so public API servers do not block our server IPs
      const CONCURRENCY = 7;
      const queue = async.queue(async (book) => {
        try {
          await handleCoverImageTransferAndUpdateBook(book);
        } catch (error) {
          console.log('Failed to execute request: error=', error);
        }
      }, CONCURRENCY);

      if (process.env.NODE_ENV !== 'test') { console.time('BENCHMARK--1b--image-transfer-to-s3'); }
      insertBookList.forEach((book) => queue.push(book));
      // Wait for all requests to complete
      await queue.drain();
      if (process.env.NODE_ENV !== 'test') { console.timeEnd('BENCHMARK--1b--image-transfer-to-s3'); }

      const validBooks = insertBookList.filter((book) => !!book.coverImage.image_path);
      await this.booksModel.insertMany(validBooks);
    }
  }

  /** Returns `storageLocation` of uploaded file (`s3Bucket` / `local-storage`) */
  async transferRemoteFileToS3Bucket(fileUrl: string) {
    const tempFilename = `${uuidv4()}${path.extname(fileUrl)}`;
    const tempPath = path.join(this.config.get<string>('UPLOAD_DIR'), tempFilename);

    const storageLocation = this.storageLocationService.generateNewStorageLocationFor('book', tempFilename);
    await downloadFileTemporarily(fileUrl, tempPath, async () => {
      const file = { path: tempPath, filename: tempFilename } as Express.Multer.File;
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
    });
    return storageLocation;
  }
}
