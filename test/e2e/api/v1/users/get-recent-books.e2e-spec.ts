/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BooksService } from '../../../../../src/books/providers/books.service';
import { BookUserStatus, BookUserStatusDocument } from '../../../../../src/schemas/bookUserStatus/bookUserStatus.schema';
import { RecentBookBlock } from '../../../../../src/schemas/recentBookBlock/recentBookBlock.schema';
import { BookActiveStatus } from '../../../../../src/schemas/book/book.enums';
import { booksFactory } from '../../../../factories/books.factory';
import { RecentBookBlockReaction } from '../../../../../src/schemas/recentBookBlock/recentBookBlock.enums';

describe('Get Recent Books (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let booksService: BooksService;
  let recentBookBlockModel: Model<RecentBookBlock>;
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
    recentBookBlockModel = moduleRef.get<Model<RecentBookBlock>>(getModelToken(RecentBookBlock.name));
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/users/recent-books', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/recent-books').expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the recent book list', async () => {
      const book = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const book1 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 1',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const book2 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 2',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const book3 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 3',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const book4 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 4',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 5',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 6',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 7',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 8',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 9',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book 10',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await recentBookBlockModel.create({
        from: activeUser._id,
        bookId: book._id,
        reaction: RecentBookBlockReaction.Block,
      });
      await recentBookBlockModel.create({
        from: activeUser._id,
        bookId: book1._id,
        reaction: RecentBookBlockReaction.Block,
      });
      await bookUserStatusModel.create({
        name: 'book user status1',
        userId: activeUser._id,
        bookId: book2._id,
        favourite: 0,
        readingList: 0,
        read: 1,
        buy: 0,
      });
      await bookUserStatusModel.create({
        name: 'book user status2',
        userId: activeUser._id,
        bookId: book3._id,
        favourite: 0,
        readingList: 0,
        read: 1,
        buy: 0,
      });
      await bookUserStatusModel.create({
        name: 'book user status3',
        userId: activeUser._id,
        bookId: book4._id,
        favourite: 0,
        readingList: 1,
        read: 1,
        buy: 0,
      });
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/recent-books')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(8);
    });
  });
});
