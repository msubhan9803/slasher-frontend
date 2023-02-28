/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { BooksService } from './books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BookStatus, BookDeletionState } from '../../schemas/book/book.enums';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

const mockHttpService = () => ({});

describe('BooksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let booksService: BooksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
  });

  describe('#create', () => {
    it('should create book', async () => {
      const sampleBook = booksFactory.build({
        status: BookStatus.Active,
        name: 'Young Goodman Brown',
        deleted: BookDeletionState.NotDeleted,
      });

      const book = await booksService.create(sampleBook);
      expect(book.toObject()).toEqual({
           __v: 0,
           _id: expect.any(mongoose.Types.ObjectId),
           name: sampleBook.name,
           status: sampleBook.status,
           deleted: sampleBook.deleted,
           createdBy: null,
           descriptions: null,
           logo: null,
           type: 0,
           createdAt: expect.any(Date),
           updatedAt: expect.any(Date),
          });
    });
  });

  describe('#findAll', () => {
    it('finds all the expected Books that are activated and not deleted', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookStatus.InActive,
          deleted: BookDeletionState.NotDeleted,
          name: 'Oh, Whistle, And I will Come To You, My Lad',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookStatus.Active,
          deleted: BookDeletionState.NotDeleted,
          name: 'The Vampire Chronicles',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookStatus.Active,
          deleted: BookDeletionState.Deleted,
          name: 'Young Goodman Brown',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookStatus.InActive,
          deleted: BookDeletionState.Deleted,
          name: 'The diffrent Book',
        }),
      );

      const activeBooks = await booksService.findAll(true);
      expect(activeBooks).toHaveLength(1);
      expect(activeBooks[0].name).toBe('The Vampire Chronicles');
    });
  });
});
