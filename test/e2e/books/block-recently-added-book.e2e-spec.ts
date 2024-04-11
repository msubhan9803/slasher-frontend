import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../helpers/factory-helpers.ts';
import { BooksService } from '../../../src/books/providers/books.service';
import { RecentBookBlock } from '../../../src/schemas/recentBookBlock/recentBookBlock.schema';
import { booksFactory } from '../../factories/books.factory';
import { BookActiveStatus } from '../../../src/schemas/book/book.enums';
import { RecentBookBlockReaction } from '../../../src/schemas/recentBookBlock/recentBookBlock.enums';

describe('Book / Block recently added book (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let booksService: BooksService;
  let recentBookBlockModel: Model<RecentBookBlock>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    booksService = moduleRef.get<BooksService>(BooksService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('POST /api/v1/books/recent/block', () => {
    let book;
    beforeEach(async () => {
      book = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'book',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await recentBookBlockModel.create({
        from: activeUser._id,
        bookId: book._id,
        reaction: RecentBookBlockReaction.Unblock,
      });
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/books/recent/block').expect(HttpStatus.UNAUTHORIZED);
    });

    it('creates the recent book block data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/books/recent/block')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ bookId: book._id.toString() });
      expect(response.status).toEqual(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
    });

    describe('Validation', () => {
      it('bookId must be a mongodb id', async () => {
        const bookId = '634912b22c2f4*5e0e62285';
        const response = await request(app.getHttpServer())
          .post('/api/v1/books/recent/block')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ bookId });
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'bookId must be a mongodb id',
          ],
          statusCode: 400,
        });
      });

      it('when bookId is not given it give below error', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/books/recent/block')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'bookId must be a mongodb id',
            'bookId should not be empty',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
