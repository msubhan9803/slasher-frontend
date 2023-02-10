/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { BooksService } from './books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { BookDocument } from '../../schemas/book/book.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

const mockHttpService = () => ({});

describe('BooksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let booksService: BooksService;
  let book: BookDocument;

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
    book = await booksService.create(booksFactory.build());
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds the expected book details', async () => {
      const bookDetails = await booksService.findAll();
      expect(bookDetails.map((bookData) => bookData.name)).toEqual([book.name]);
    });
  });
});
