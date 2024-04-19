/* eslint-disable max-len */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BooksService } from '../../../../../src/books/providers/books.service';
import { booksFactory } from '../../../../factories/books.factory';
import { BookUserStatus, BookUserStatusDocument } from '../../../../../src/schemas/bookUserStatus/bookUserStatus.schema';
import { BookActiveStatus, BookDeletionState, BookType } from '../../../../../src/schemas/book/book.enums';

describe('Count Book List (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let booksService: BooksService;
  let bookUserStatusModel: Model<BookUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    booksService = moduleRef.get<BooksService>(BooksService);
    bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let book1;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build({ userName: 'Star Wars Fan' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    book1 = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
        deleted: BookDeletionState.NotDeleted,
        type: BookType.OpenLibrary,
        name: 'bird',
      }),
    );
  });

  describe('Get /api/v1/users/:userId/book-list-count', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get(`/api/v1/users/${activeUser.id}/book-list-count`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('count for book list', () => {
      it('count for read book list', async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          reading: 0,
          read: 1,
          buy: 0,
        });
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?type=read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('1');
      });

      it('count for reading book list', async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 1,
          read: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 1,
          read: 0,
          buy: 0,
        });
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?type=reading`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('2');
      });

      it('count for favorite book list', async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 1,
          readingList: 0,
          read: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 1,
          readingList: 0,
          read: 0,
          buy: 0,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 1,
          readingList: 0,
          read: 0,
          buy: 0,
        });
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?type=favorite`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('3');
      });

      it('count for buy book list', async () => {
        await bookUserStatusModel.create({
          name: 'book user status1',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 0,
          read: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status2',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 0,
          read: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status3',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 0,
          read: 0,
          buy: 1,
        });
        await bookUserStatusModel.create({
          name: 'book user status4',
          userId: activeUser._id,
          bookId: book1._id,
          favourite: 0,
          readingList: 0,
          read: 0,
          buy: 1,
        });
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?type=buy`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('4');
      });
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const userId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${userId}/book-list-count?type=read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });

      it('list type should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('type should not be empty');
      });

      it('list type must be valid', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/book-list-count?&type=SOME_BAD_VALUE`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('type must be one of the following values: reading, read, favorite, buy');
      });
    });
  });
});
