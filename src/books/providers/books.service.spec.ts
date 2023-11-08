/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import { of } from 'rxjs';
import { AppModule } from '../../app.module';
import { BooksService } from './books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BookActiveStatus, BookType } from '../../schemas/book/book.enums';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { Book, BookDocument } from '../../schemas/book/book.schema';
import { UserDocument } from '../../schemas/user/user.schema';
import { WorthReadingStatus } from '../../types';
import {
  keyData1, keyData2, keyEditionData1, keyEditionData2,
  mockBooksSearchQueryFromOpenLibrary, mockBooksSearchQueryFromOpenLibraryNoDocs,
} from './books.service.mock';

const mockHttpService = () => ({});

describe('BooksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let booksService: BooksService;
  let bookUserStatusModel: Model<BookUserStatusDocument>;
  let usersService: UsersService;
  let book: BookDocument;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let httpService: HttpService;
  let bookModel: Model<BookDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    booksService = moduleRef.get<BooksService>(BooksService);
    bookModel = moduleRef.get<Model<BookDocument>>(getModelToken(Book.name));
    bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));
    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
    httpService = await app.get<HttpService>(HttpService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build({ userName: 'superman1' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a book', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      expect(await booksService.findById(book.id, false)).toBeTruthy();
    });
  });

  describe('#BooksIdsForUser', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let activeUser;
    let book1;
    let book2;
    let book3;
    beforeEach(async () => {
      book1 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
        }),
      );
      book2 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
        }),
      );
      book3 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
        }),
      );
      activeUser = await usersService.create(userFactory.build());
    });

    describe('#getReadListBookIdsForUser', () => {
      beforeEach(async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          read: 1,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book2._id,
          favourite: 0,
          read: 1,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book3._id,
          favourite: 0,
          read: 1,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status4',
          userId: activeUser._id,
          bookId: book._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
      });

      it('find read list bookids for users', async () => {
        const bookIds = await booksService.getReadListBookIdsForUser(activeUser._id);
        expect(bookIds).toEqual([book1._id, book2._id, book3._id]);
      });
    });

    describe('#getReadingListBookIdsForUser', () => {
      beforeEach(async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          read: 0,
          readingList: 1,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book2._id,
          favourite: 0,
          read: 0,
          readingList: 1,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book3._id,
          favourite: 0,
          read: 0,
          readingList: 1,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status4',
          userId: activeUser._id,
          bookId: book._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
      });

      it('find reading list bookids for users', async () => {
        const bookIds = await booksService.getReadingListBookIdsForUser(activeUser._id);
        expect(bookIds).toEqual([book1._id, book2._id, book3._id]);
      });
    });

    describe('#getBuyListBookIdsForUser', () => {
      beforeEach(async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          read: 0,
          readingList: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book2._id,
          favourite: 0,
          read: 0,
          readingList: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book3._id,
          favourite: 0,
          read: 0,
          readingList: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status4',
          userId: activeUser._id,
          bookId: book._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
      });

      it('find buy list bookids for users', async () => {
        const bookIds = await booksService.getBuyListBookIdsForUser(activeUser._id);
        expect(bookIds).toEqual([book1._id, book2._id, book3._id]);
      });
    });

    describe('#getFavoriteListBookIdsForUser', () => {
      beforeEach(async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book2._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book3._id,
          favourite: 1,
          read: 0,
          readingList: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status4',
          userId: activeUser._id,
          bookId: book._id,
          favourite: 0,
          read: 0,
          readingList: 0,
          buy: 1,
        });
      });

      it('find favorite list bookids for users', async () => {
        const bookIds = await booksService.getFavoriteListBookIdsForUser(activeUser._id);
        expect(bookIds).toEqual([book1._id, book2._id, book3._id]);
      });
    });
  });

  describe('#findAll', () => {
    it('only includes books of type BookType.openLibrary', async () => {
      await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active, name: 'a', type: BookType.Free }),
      );
      await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active, name: 'b', type: BookType.OpenLibrary }),
      );

      const booksList = await booksService.findAll(10, true, 'name');
      expect(booksList).toHaveLength(1);
    });

    it('when sort by name is applied than expected response', async () => {
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Afraid',
            bookId: '/works/OL450063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Afraid!',
            bookId: '/works/OL460063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Afraid 2',
            bookId: '/works/OL470063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Afraid: Containment',
            bookId: '/works/OL480063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Beetle',
            bookId: '/works/OL450763W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Carmilla',
            bookId: '/works/OL456063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Dracula',
            bookId: '/works/OL458063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Frankenstein',
            bookId: '/works/OL450093W',
          },
        ),
      );
      const limit = 10;
      const booksList = await booksService.findAll(limit, true, 'name');
      for (let i = 1; i < booksList.length; i += 1) {
        expect(booksList[i - 1].sort_name < booksList[i].sort_name).toBe(true);
      }
      expect(booksList).toHaveLength(8);
    });

    it('when sort by publishDate is applied than expected response', async () => {
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            publishDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          publishDate: DateTime.now().minus({ days: 1 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            publishDate: DateTime.now().minus({ days: 2 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            publishDate: DateTime.now().minus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            publishDate: DateTime.now().minus({ days: 3 }).toJSDate(),
          },

        ),
      );
      const limit = 5;
      const booksList = await booksService.findAll(limit, true, 'publishDate');
      for (let i = 0; i < booksList.length - 1; i += 1) {
        expect(booksList[i].sortPublishDate > booksList[i + 1].sortPublishDate).toBe(true);
      }
      expect(booksList).toHaveLength(5);
    });

    it('finds all the expected book details that has not deleted and Inactive status', async () => {
      const numberOfInActiveBooks = 4;
      for (let index = 0; index < numberOfInActiveBooks; index += 1) {
        await booksService.create(
          booksFactory.build(),
        );
      }
      const limit = 5;
      const booksList = await booksService.findAll(limit, false, 'name');
      // 4 (numberOfInactiveBooks) + 1 (inactive book created in top-level `beforeEach`) = 5
      expect(booksList).toHaveLength(4);
    });

    it('when name contains supplied than expected response', async () => {
      const bookData = await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Afraid',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'The King in Yellow',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Coraline',
          },
        ),
      );
      const limit = 5;
      const booksList = await booksService.findAll(limit, true, 'name', bookData.id, 'king');
      expect(booksList).toHaveLength(1);
    });

    it('when sort_name startsWith supplied than expected response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Coraline',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'The King in Yellow',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Beetle',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Beetle 1',
        }),
      );
      const limit = 5;
      const booksList = await booksService.findAll(limit, true, 'name', null, null, null, 'b');
      expect(booksList).toHaveLength(2);
    });

    it('when books is sort by rating than expected response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Coraline',
          rating: 5,
          ratingUsersCount: 30,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'The King in Yellow',
          rating: 5,
          ratingUsersCount: 9,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Beetle',
          rating: 3,
          ratingUsersCount: 25,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Beetle 1',
          rating: 3,
          ratingUsersCount: 24,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'Beetle 2',
          rating: 1,
          ratingUsersCount: 50,
        }),
      );
      const limit = 5;
      const booksList = await booksService.findAll(limit, true, 'rating');
      const bookOrder = booksList.map((bov) => ({ rating: bov.rating, ratingUsersCount: bov.ratingUsersCount }));
      // Both `rating` and `ratingUsersCount` are useful to order books.
      expect(bookOrder).toEqual([
        { rating: 5, ratingUsersCount: 30 },
        { rating: 5, ratingUsersCount: 9 },
        { rating: 3, ratingUsersCount: 25 },
        { rating: 3, ratingUsersCount: 24 },
        { rating: 1, ratingUsersCount: 50 },
      ]);
      expect(booksList).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
        const name = ['Alive', 'Again alive', 'Afield', 'Audition', 'Aghost'];
        const rating = [1, 2, 2, 2.5, 3];
        for (let i = 0; i < 5; i += 1) {
          await booksService.create(
            booksFactory.build(
              {
                status: BookActiveStatus.Active,
                rating: rating[i],
                name: name[i],
                ratingUsersCount: 22, // must be greater than `MINIMUM_NUMBER_OF_RATING_USES_COUNT`
              },
            ),
          );
        }
      });
      it('sort by name returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await booksService.findAll(limit, true, 'name');
        const secondResults = await booksService.findAll(limit, true, 'name', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });

      it('sort by release date returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await booksService.findAll(limit, true, 'publishDate');
        const secondResults = await booksService.findAll(limit, true, 'publishDate', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });

      it('sort by rating returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await booksService.findAll(limit, true, 'rating');
        expect(firstResults).toHaveLength(3);

        const firstResultsOrder = firstResults.map((m) => ({ rating: m.rating }));
        expect(firstResultsOrder).toEqual([{ rating: 3 }, { rating: 2.5 }, { rating: 2 }]);

        const secondResults = await booksService.findAll(limit, true, 'rating', firstResults[limit - 1].id);
        expect(secondResults).toHaveLength(2);

        const secondResultsOrder = secondResults.map((m) => ({ rating: m.rating }));
        expect(secondResultsOrder).toEqual([{ rating: 2 }, { rating: 1 }]);
      });

      it('sort by name and startsWith returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await booksService.findAll(limit, true, 'name');
        const secondResults = await booksService.findAll(limit, true, 'name', firstResults[limit - 1].id, null, null, 'a');
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });
    });
  });

  describe('#createOrUpdateRating', () => {
    it('create or update `rating` in a bookUserStatus document', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const rating = 3;
      const bookUserStatus = await booksService.createOrUpdateRating(book.id, rating, activeUser.id);
      expect(bookUserStatus.rating).toBe(rating);
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.rating).toBe(rating);

      // Delete rating should update `bookUserStatus.rating`, `book.rating` and `book.ratingUsersCount` properly
      const bookUserStatusAfter = await booksService.createOrUpdateRating(book.id, 0, activeUser.id);
      expect(bookUserStatusAfter.rating).toBe(0);
      const bookDataAfter = await booksService.findById(book.id, false);
      expect(bookDataAfter.rating).toBe(0);
      expect(bookDataAfter.ratingUsersCount).toBe(0);
    });

    it('verify that average of all `rating` of bookUserStatus is updated in book', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const rating1 = 1;
      const bookUserStatus1 = await booksService.createOrUpdateRating(book.id, rating1, activeUser.id);
      expect(bookUserStatus1.userData.rating).toBe(rating1);

      const rating2 = 2;
      const bookUserStatus2 = await booksService.createOrUpdateRating(book.id, rating2, user1.id);
      expect(bookUserStatus2.userData.rating).toBe(rating2);

      // Verify that average rating is correctly updated in book
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.rating).toBe(1.5);
    });
  });

  describe('#createOrUpdateGoreFactorRating', () => {
    it('create or update `goreFactorRating` in a bookUserStatus document', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const goreFactorRating = 3;
      const bookUserStatus = await booksService.createOrUpdateGoreFactorRating(book.id, goreFactorRating, activeUser.id);
      expect(bookUserStatus.goreFactorRating).toBe(goreFactorRating);
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.goreFactorRating).toBe(goreFactorRating);
      expect(updatedBook.goreFactorRatingUsersCount).toBe(1);

      // Delete rating should update `bookUserStatus.goreFactorRating`, `book.goreFactorRating`
      // and `book.goreFactorRatingUsersCount` properly
      const bookUserStatusAfter = await booksService.createOrUpdateGoreFactorRating(book.id, 0, activeUser.id);
      expect(bookUserStatusAfter.goreFactorRating).toBe(0);
      const bookDataAfter = await booksService.findById(book.id, false);
      expect(bookDataAfter.goreFactorRating).toBe(0);
      expect(bookDataAfter.goreFactorRatingUsersCount).toBe(0);
    });

    it('verify that average of all `goreFactorRating` of bookUserStatus is updated in book', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const goreFactorRating1 = 1;
      const bookUserStatus1 = await booksService.createOrUpdateGoreFactorRating(book.id, goreFactorRating1, activeUser.id);
      expect(bookUserStatus1.userData.goreFactorRating).toBe(goreFactorRating1);

      const goreFactorRating2 = 2;
      const bookUserStatus2 = await booksService.createOrUpdateGoreFactorRating(book.id, goreFactorRating2, user1.id);
      expect(bookUserStatus2.userData.goreFactorRating).toBe(goreFactorRating2);

      // Verify average `goreFactorRating` is correctly updated in book
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.goreFactorRating).toBe(1.5);
    });
  });

  describe('#createOrUpdateWorthReading', () => {
    it('create or update  a bookrUserStatus document', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const worthReading = WorthReadingStatus.Up;
      const bookUserStatus = await booksService.createOrUpdateWorthReading(book.id, worthReading, activeUser.id);
      expect(bookUserStatus.worthReading).toBe(worthReading);
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.worthReading).toBe(WorthReadingStatus.Up);
      expect(updatedBook.worthReadingUpUsersCount).toBe(1);
      expect(updatedBook.worthReadingDownUsersCount).toBe(0);

      // Delete rating should update `bookUserStatus.worthReading`, `book.goreFactorRating`
      // and `book.goreFactorRatingUsersCount` properly
      const bookUserStatusAfter = await booksService.createOrUpdateWorthReading(book.id, 0, activeUser.id);
      expect(bookUserStatusAfter.worthReading).toBe(0);
      const bookAfter = await booksService.findById(book.id, false);
      expect(bookAfter.worthReading).toBe(WorthReadingStatus.NoRating);
      expect(bookAfter.worthReadingUpUsersCount).toBe(0);
      expect(bookAfter.worthReadingDownUsersCount).toBe(0);
    });

    it('verify that average of all WorthReading of bookrUserStatus is updated in book', async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      const worthReading1 = WorthReadingStatus.Down;
      const bookUserStatus1 = await booksService.createOrUpdateWorthReading(book.id, worthReading1, activeUser.id);
      expect(bookUserStatus1.worthReading).toBe(worthReading1);

      const worthReading2 = WorthReadingStatus.Up;
      const bookUserStatus2 = await booksService.createOrUpdateWorthReading(book.id, worthReading2, user1.id);
      expect(bookUserStatus2.worthReading).toBe(worthReading2);

      /** Verify average `WorthReading` is rounded to the nearest integer
       * i.e,, Math.round((1+2)/2) = Math.round(1.5) = 2 = WorthReadingStatus.Up
       */
      const updatedBook = await booksService.findById(book.id, false);
      expect(updatedBook.worthReading).toBe(WorthReadingStatus.Up);
    });
  });

  describe('#getUserBookStatusRatings', () => {
    const rating = 3;
    const goreFactorRating = 4;
    const worthReading = WorthReadingStatus.Up;
    beforeEach(async () => {
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      await booksService.createOrUpdateRating(book.id, rating, activeUser.id);
      await booksService.createOrUpdateGoreFactorRating(book.id, goreFactorRating, activeUser.id);
      await booksService.createOrUpdateWorthReading(book.id, worthReading, activeUser.id);
    });
    it('create or update `rating` in a bookrUserStatus document', async () => {
      const bookUserStatus = await booksService.getUserBookStatusRatings(book.id, activeUser.id);
      expect(bookUserStatus.rating).toBe(rating);
      expect(bookUserStatus.goreFactorRating).toBe(goreFactorRating);
      expect(bookUserStatus.worthReading).toBe(worthReading);
    });
  });

  describe('#getRatingUsersCount', () => {
    beforeEach(async () => {
      // create rating by two users
      book = await booksService.create(
        booksFactory.build({ status: BookActiveStatus.Active }),
      );
      await booksService.createOrUpdateRating(book.id, 4, activeUser.id);
      await booksService.createOrUpdateRating(book.id, 5, user1.id);
    });
    it('create or update `rating` in a bookUserStatus document', async () => {
      const ratingUsersCount = await booksService.getRatingUsersCount(book.id);
      expect(ratingUsersCount).toBe(2);
    });
  });

  describe('#getBooksFromOpenLibrary', () => {
    describe('successful fetching books', () => {
      beforeEach(async () => {
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: mockBooksSearchQueryFromOpenLibrary,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyData1,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyEditionData1,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyData2,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyEditionData2,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: mockBooksSearchQueryFromOpenLibraryNoDocs,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
      });
      it('test', async () => {
        const result = await booksService.syncWithOpenLibrary();
        expect(result).toEqual({
          success: true,
          message: 'Successfully completed the cron job',
        });
        const books = await bookModel.find();
        expect(books).toHaveLength(2);
        // Verify both books are added:
        // book1
        expect(books[0].name).toBe('The Empty House And Other Ghost Stories');
        expect(books[0].author[0]).toBe('Algernon Blackwood');
        expect(books[0].coverImageId).toBe(2808629);
        expect(books[0].coverImage.image_path).toBeTruthy();
        // book2
        expect(books[1].name).toBe('Dr. Nikola\'s Experiment');
        expect(books[1].author[0]).toBe('Guy Newell Boothby');
        expect(books[0].coverImageId).toBe(2808629);
        expect(books[0].coverImage.image_path).toBeTruthy();
      });
    });

    describe('All fields e.g, `name`, `author`, etc of existing book should update on sync', () => {
      beforeEach(async () => {
        await booksService.create(
          booksFactory.build({
            bookId: mockBooksSearchQueryFromOpenLibrary.docs[0].key,
            coverEditionKey: mockBooksSearchQueryFromOpenLibrary.docs[0].cover_edition_key,
            name: 'abc',
            author: ['def'],
          }),
        );

        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: mockBooksSearchQueryFromOpenLibrary,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyData1,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyEditionData1,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyData2,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: keyEditionData2,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        jest.spyOn(httpService, 'get').mockImplementationOnce(() => of({
          data: mockBooksSearchQueryFromOpenLibraryNoDocs,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
      });
      it('test', async () => {
        const result = await booksService.syncWithOpenLibrary();
        expect(result).toEqual({
          success: true,
          message: 'Successfully completed the cron job',
        });
        const books = await bookModel.find();
        expect(books).toHaveLength(2);
        // Verify book1's `name` and `author` is updated
        expect(books[0].name).toBe('The Empty House And Other Ghost Stories');
        expect(books[0].author[0]).toBe('Algernon Blackwood');
        // book2 is newly added
        expect(books[1].name).toBe('Dr. Nikola\'s Experiment');
        expect(books[1].author[0]).toBe('Guy Newell Boothby');
      });
    });
  });

  describe('#getBookListCountForUser', () => {
    let book1;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let activeUser;
    beforeEach(async () => {
      book1 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          type: BookType.OpenLibrary,
        }),
      );
      activeUser = await usersService.create(userFactory.build());
    });

    it('watch bookListCount', async () => {
      const countBefore = await booksService.getBookListCountForUser(activeUser._id, 'read');
      expect(countBefore).toBe(0);
      await bookUserStatusModel.create({
        name: 'book user status1',
        userId: activeUser._id,
        bookId: book1._id,
        favourite: 0,
        readingList: 0,
        read: 1,
        buy: 0,
      });
      const count = await booksService.getBookListCountForUser(activeUser._id, 'read');
      expect(count).toBe(1);
    });
    it('watched bookListCount', async () => {
      const countBefore = await booksService.getBookListCountForUser(activeUser._id, 'reading');
      expect(countBefore).toBe(0);
      await bookUserStatusModel.create({
        name: 'book user status1',
        userId: activeUser._id,
        bookId: book1._id,
        favourite: 0,
        readingList: 1,
        read: 0,
        buy: 0,
      });
      const count = await booksService.getBookListCountForUser(activeUser._id, 'reading');
      expect(count).toBe(1);
    });
    it('favorite bookListCount', async () => {
      const countBefore = await booksService.getBookListCountForUser(activeUser._id, 'favorite');
      expect(countBefore).toBe(0);
      await bookUserStatusModel.create({
        name: 'book user status1',
        userId: activeUser._id,
        bookId: book1._id,
        favourite: 1,
        readingList: 0,
        read: 0,
        buy: 0,
      });
      const count = await booksService.getBookListCountForUser(activeUser._id, 'favorite');
      expect(count).toBe(1);
    });
    it('buy bookListCount', async () => {
      const countBefore = await booksService.getBookListCountForUser(activeUser._id, 'buy');
      expect(countBefore).toBe(0);
      await bookUserStatusModel.create({
        name: 'book user status1',
        userId: activeUser._id,
        bookId: book1._id,
        favourite: 0,
        readingList: 0,
        read: 0,
        buy: 1,
      });
      const count = await booksService.getBookListCountForUser(activeUser._id, 'buy');
      expect(count).toBe(1);
    });
  });
});
