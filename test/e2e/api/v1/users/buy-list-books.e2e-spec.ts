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
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { WorthReadingStatus } from '../../../../../src/types';
import { BooksService } from '../../../../../src/books/providers/books.service';
import { BookUserStatus, BookUserStatusDocument } from '../../../../../src/schemas/bookUserStatus/bookUserStatus.schema';
import { booksFactory } from '../../../../factories/books.factory';
import { BookType, BookActiveStatus } from '../../../../../src/schemas/book/book.enums';

describe('Buy List Books (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let booksService: BooksService;
  let bookUserStatusModel: Model<BookUserStatusDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    booksService = moduleRef.get<BooksService>(BooksService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    bookUserStatusModel = moduleRef.get<Model<BookUserStatusDocument>>(getModelToken(BookUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let book1;
  let book2;
  let book3;
  let book4;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build({ userName: 'Star Wars Fan' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Abe Kenobi' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    book1 = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
        type: BookType.OpenLibrary,
        name: 'Coraline',
      }),
    );
    book2 = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
        type: BookType.OpenLibrary,
        name: 'The King in Yellow',
      }),
    );
    book3 = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
        type: BookType.OpenLibrary,
        name: 'Beetle',
      }),
    );
    book4 = await booksService.create(
      booksFactory.build({
        status: BookActiveStatus.Active,
        type: BookType.OpenLibrary,
        name: 'Dracula',
      }),
    );

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
      userId: user1._id,
      bookId: book4._id,
      favourite: 0,
      read: 0,
      readingList: 0,
      buy: 1,
    });
  });

  describe('Get /api/v1/users/:userId/buy-booklist', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get(`/api/v1/users/${activeUser.id}/buy-booklist`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('User all the buy booklist', () => {
      it('get all the user buy-booklist', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: book3.name,
            coverImage: null,
            rating: 0,
            publishDate: expect.any(String),
            worthReading: WorthReadingStatus.NoRating,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: book2.name,
            coverImage: null,
            rating: 0,
            publishDate: expect.any(String),
            worthReading: WorthReadingStatus.NoRating,
          },
        ]);
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const limit = 2;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${nonExistentUserId}/buy-booklist?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('when user is block than expected response.', async () => {
        const user0 = await usersService.create(userFactory.build());
        await blocksModel.create({
          from: activeUser.id,
          to: user0._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user0.id}/buy-booklist?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          message: 'Request failed due to user block.',
          statusCode: 404,
        });
      });

      it('when name contains supplied than expected all books response', async () => {
        const limit = 5;
        const nameContains = 'king';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(1);
      });

      it('when the startsWith is exist than expected response', async () => {
        const sortNameStartsWith = 'b';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([{
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: book3.name,
          coverImage: null,
          publishDate: expect.any(String),
          rating: 0,
          worthReading: WorthReadingStatus.NoRating,
        }]);
      });

      it('when startsWith is not exist and nameContains is exist than expected response', async () => {
        const nameContains = 'king';
        const sortNameStartsWith = 'p';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });

      it('when startsWith is exist and nameContains is not exist than expected response', async () => {
        const nameContains = 'queen';
        const sortNameStartsWith = 'b';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });

      it('when startsWith and nameContains is exists than expected response', async () => {
        const nameContains = 'in';
        const sortNameStartsWith = 'k';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([{
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: book2.name,
          coverImage: null,
          publishDate: expect.any(String),
          rating: 0,
          worthReading: WorthReadingStatus.NoRating,
        }]);
      });
    });

    describe('should NOT find read list book when users are not friends', () => {
      let user2;
      beforeEach(async () => {
        user2 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
      });

      it('should not allow the read list books when users are not friends', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user2.id}/buy-booklist?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
      });
    });

    describe('Validations', () => {
      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('returns an error if the limit is higher than allowed', async () => {
        const limit = 61;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'publishDate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 60');
      });

      it('sortBy must be one of the following values: name, publishDate, rating', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: name, publishDate, rating');
      });

      it('name be shorter than or equal to 30 characters', async () => {
        const limit = 10;
        const nameContains = new Array(35).join('z');
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'publishDate'}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('nameContains must be shorter than or equal to 30 characters');
      });

      it('responds with error message when an invalid startsWith supplied', async () => {
        const startsWith = '@qw$re';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/buy-booklist?limit=${limit}&sortBy=${'name'}&startsWith=${startsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: ['startsWith must match /^[a-z0-9#]+$/ regular expression'],
          error: 'Bad Request',
        });
      });
    });
  });
});
