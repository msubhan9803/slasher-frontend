/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { BooksService } from './books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BookStatus, BookDeletionState } from '../../schemas/book/book.enums';

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
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
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
