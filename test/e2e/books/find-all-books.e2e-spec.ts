/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { BooksService } from '../../../src/books/providers/books.service';
import { booksFactory } from '../../factories/books.factory';
import {
  BookStatus,
  BookDeletionState,
} from '../../../src/schemas/book/book.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Find All Books (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let booksService: BooksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    booksService = moduleRef.get<BooksService>(BooksService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET All Books', () => {
    it('Find all Books with name sorting', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookStatus.Active,
          name: 'Young Goodman Brown',
          deleted: BookDeletionState.NotDeleted,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookStatus.Active,
          name: 'The Vampire Chronicles',
          deleted: BookDeletionState.NotDeleted,
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookStatus.Active,
          name: 'Oh, Whistle, And I will Come To You, My Lad',
          deleted: BookDeletionState.NotDeleted,
        }),
      );
      const response = await request(app.getHttpServer())
        .get('/books')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Oh, Whistle, And I will Come To You, My Lad',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'The Vampire Chronicles',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Young Goodman Brown',
        },
      ]);
    });
  });
});
