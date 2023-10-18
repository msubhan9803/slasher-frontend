/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import { AppModule } from '../../app.module';
import { BooksService } from './books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BookStatus, BookType } from '../../schemas/book/book.enums';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { BookUserStatus, BookUserStatusDocument } from '../../schemas/bookUserStatus/bookUserStatus.schema';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';

const mockHttpService = () => ({});

describe('BooksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let booksService: BooksService;
  let bookUserStatusModel: Model<BookUserStatusDocument>;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    booksService = moduleRef.get<BooksService>(BooksService);
    bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));
    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a book', async () => {
      const book = await booksService.create(
        booksFactory.build(),
      );
      expect(await booksService.findById(book.id, false)).toBeTruthy();
    });
  });

  describe('#BooksIdsForUser', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let activeUser;
    let book;
    let book1;
    let book2;
    let book3;
    beforeEach(async () => {
      book = await booksService.create(
        booksFactory.build(),
      );
      book1 = await booksService.create(
        booksFactory.build(),
      );
      book2 = await booksService.create(
        booksFactory.build(),
      );
      book3 = await booksService.create(
        booksFactory.build(),
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
        booksFactory.build({ name: 'a', type: BookType.Free }),
      );
      await booksService.create(
        booksFactory.build({ name: 'b', type: BookType.OpenLibrary }),
      );

      const booksList = await booksService.findAll(2, true, 'name');
      expect(booksList).toHaveLength(1);
    });

    it('when sort by name is applied than expected response', async () => {
      await booksService.create(
        booksFactory.build(
          {
            name: 'Afraid',
            status: BookStatus.Active,
            bookId: '/works/OL450063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Afraid!',
            status: BookStatus.Active,
            bookId: '/works/OL460063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Afraid 2',
            status: BookStatus.Active,
            bookId: '/works/OL470063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Afraid: Containment',
            status: BookStatus.Active,
            bookId: '/works/OL480063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Beetle',
            status: BookStatus.Active,
            bookId: '/works/OL450763W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Carmilla',
            status: BookStatus.Active,
            bookId: '/works/OL456063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Dracula',
            status: BookStatus.Active,
            bookId: '/works/OL458063W',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            name: 'Frankenstein',
            status: BookStatus.Active,
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
            publishDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build({
          publishDate: DateTime.now().minus({ days: 1 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build(
          {
            publishDate: DateTime.now().minus({ days: 2 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            publishDate: DateTime.now().minus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
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

    it('finds all the expected book details that has not deleted and active status', async () => {
      for (let index = 0; index < 4; index += 1) {
        await booksService.create(
          booksFactory.build(),
        );
      }
      const limit = 5;
      const booksList = await booksService.findAll(limit, false, 'name');
      expect(booksList).toHaveLength(4);
    });

    it('when name contains supplied than expected response', async () => {
      const bookData = await booksService.create(
        booksFactory.build(
          {
            status: BookStatus.Active,
            name: 'Afraid',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookStatus.Active,
            name: 'The King in Yellow',
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookStatus.Active,
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
          name: 'Coraline',
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'The King in Yellow',
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'Beetle',
        }),
      );
      await booksService.create(
        booksFactory.build({
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
          name: 'Coraline',
          rating: 1,
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'The King in Yellow',
          rating: 1.5,
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'Beetle',
          rating: 2,
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'Beetle 1',
          rating: 2.5,
        }),
      );
      await booksService.create(
        booksFactory.build({
          name: 'Beetle 2',
          rating: 3,
        }),
      );
      const limit = 5;
      const booksList = await booksService.findAll(limit, true, 'rating');
      for (let i = 1; i < booksList.length; i += 1) {
        expect(booksList[i].sortRating < booksList[i - 1].sortRating).toBe(true);
      }
      expect(booksList).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
        const name = ['Alive', 'Again alive', 'Afield', 'Audition', 'Aghost'];
        const rating = [1, 1.5, 2, 2.5, 3];
        for (let i = 0; i < 5; i += 1) {
          await booksService.create(
            booksFactory.build(
              {
                status: BookStatus.Active,
                rating: rating[i],
                name: name[i],
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
        const secondResults = await booksService.findAll(limit, true, 'rating', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
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
});
