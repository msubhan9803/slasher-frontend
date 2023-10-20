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
import { BookStatus, BookDeletionState, BookType } from '../../schemas/book/book.enums';
import { Book, BookDocument } from '../../schemas/book/book.schema';
import { NON_ALPHANUMERIC_REGEX, isDevelopmentServer } from '../../constants';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import {
  BookUserStatusBuy, BookUserStatusFavorites, BookUserStatusRead, BookUserStatusReadingList,
} from '../../schemas/bookUserStatus/bookUserStatus.enums';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { BookKeysFromOpenLibrary, BookFromOpenLibrary, WorthReadingStatus } from '../../types';
import { createPublishDateForOpenLibrary } from '../../utils/date-utils';
import { S3StorageService } from '../../local-storage/providers/s3-storage.service';
import { getCoverImageForBookOfOpenLibrary, getExtensionFromFilename } from '../../utils/text-utils';
import { StorageLocationService } from '../../global/providers/storage-location.service';
import { LocalStorageService } from '../../local-storage/providers/local-storage.service';
import { downloadFileTemporarily } from '../../utils/file-download-utils';

@Injectable()
export class BooksService {
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
      booksFindQuery.status = BookStatus.Active;
    }
    const bookData = await this.booksModel.findOne(booksFindQuery).exec();
    return bookData ? bookData.toObject() : null;
  }

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
      booksFindAllQuery.status = BookStatus.Active;
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
      booksFindAllQuery.sortRating = { $lt: afterBook.sortRating };
    }

    if (nameContains || sortNameStartsWith) {
      let combinedRegex = '';
      if (sortNameStartsWith && sortNameStartsWith !== '#') {
        combinedRegex += `^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`;
      } else if (sortNameStartsWith === '#') {
        combinedRegex += NON_ALPHANUMERIC_REGEX.source;
      }

      if (nameContains) {
        if (combinedRegex) {
          combinedRegex += `${combinedRegex ? '.*' : ''}${escapeStringForRegex(nameContains)}`;
        } else {
          combinedRegex += `${escapeStringForRegex(nameContains)}`;
        }
      }

      if (!booksFindAllQuery.sort_name) {
        booksFindAllQuery.sort_name = {};
      }
      booksFindAllQuery.sort_name.$regex = new RegExp(combinedRegex, 'i');
    }

    let sortBooksByNameAndReleaseDate: any;
    if (sortBy === 'name') {
      sortBooksByNameAndReleaseDate = { sort_name: 1 };
    } else if (sortBy === 'publishDate') {
      sortBooksByNameAndReleaseDate = { sortPublishDate: -1 };
    } else {
      sortBooksByNameAndReleaseDate = { sortRating: -1 };
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

  async getBooksFromOpenLibrary() {
    const arr: BookFromOpenLibrary[] = [];
    let offset = 0;
    // TODO: Remove `isDevelopmentServer` usage

    const limit = isDevelopmentServer ? 3 : 1000; // ! FOR production we value =1000
    let hasMoreData = true;

    while (hasMoreData) {
      const searchQuery = 'subject%3Ahorror'; // subject:horror
      const bookFieldKeys: BookKeysFromOpenLibrary = ['author_name', 'cover_edition_key', 'key'];
      const fields = bookFieldKeys.join(','); // Helps in overfetching data issue from API.
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

  async syncWithOpenLibrary(): Promise<ReturnBookDb> {
    try {
      const booksFromOpenLibrary = await this.getBooksFromOpenLibrary();
      const booksToAdd: Array<Partial<BookDocument>> = [];
      for (let i = 0; i < booksFromOpenLibrary.length; i += 1) {
        // eslint-disable-next-line no-console
        console.log('i?', i);
        const book: Partial<BookDocument> = {
          type: BookType.OpenLibrary,
        };
        const [keyDataSettled, editionKeyDataSettled]: any = await Promise.allSettled([
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/${booksFromOpenLibrary[i].key}.json`),
          ),
          lastValueFrom(
            this.httpService.get<any>(`https://openlibrary.org/works/${booksFromOpenLibrary[i].cover_edition_key}.json`),
          ),
        ]);

        // From `searchBooksData` API
        book.bookId = booksFromOpenLibrary[i].key;
        book.coverEditionKey = booksFromOpenLibrary[i].cover_edition_key;
        book.author = booksFromOpenLibrary[i]?.author_name ?? [];
        // From `keyData` API
        const keyData = (keyDataSettled.status === 'fulfilled') ? keyDataSettled.value : null;
        if (keyData) {
          book.description = keyData.data?.description?.value ?? keyData.data?.description;
        }
        // From `editionKeyData` API
        const editionKeyData = (editionKeyDataSettled.status === 'fulfilled') ? editionKeyDataSettled.value : null;
        if (editionKeyData) {
          book.name = editionKeyData.data.title;
          const coverImageId = editionKeyData.data?.covers?.[0];
          if (coverImageId) {
            book.coverImageId = coverImageId;
            const coverImgeUrl = getCoverImageForBookOfOpenLibrary(coverImageId);
            const storageLocation = await this.uploadToS3Bucket(coverImgeUrl);
            book.coverImage = { image_path: storageLocation, description: null };
          }
          book.numberOfPages = editionKeyData.data.number_of_pages;
          book.publishDate = createPublishDateForOpenLibrary(editionKeyData.data.publish_date);
          book.isbnNumber = [];
          if (editionKeyData.data.isbn_13) {
            book.isbnNumber.push(...editionKeyData.data.isbn_13);
          }
          if (editionKeyData.data.isbn_10) {
            book.isbnNumber.push(...editionKeyData.data.isbn_10);
          }
        }

        // Note: We only add book to `mainBookArray` if all required fields are present in `bookDataObject` i.e, name, coverEditionKey, etc
        if (book.name && book.coverEditionKey) {
          booksToAdd.push(book);
        }
      }
      if (booksToAdd.length !== 0) {
        await this.booksModel.insertMany(booksToAdd);
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

  // TODO-SAHIL: Write tests for this function
  /** Returns `storageLocation` of uploaded file (`s3Bucket` or `local-storage`) */
  async uploadToS3Bucket(fileUrl: string) {
    const extension = getExtensionFromFilename(fileUrl);

    const tempFilename = `${uuidv4()}.${extension}`;
    const tempPath = `./local-storage/${tempFilename}`;

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
