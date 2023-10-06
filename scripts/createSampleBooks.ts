/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { createApp } from './createApp';
import { BooksService } from '../src/books/providers/books.service';
import { Book, BookDocument } from '../src/schemas/book/book.schema';

// Run this file via below command:
// NODE_ENV=development npx ts-node ./scripts/createSampleBooks.ts

const deleteAllBooks = async (app: INestApplication) => {
  const booksModel = app.get<Model<BookDocument>>(getModelToken(Book.name));
  // Delete all documents in `books` collection
  await booksModel.deleteMany({});
  console.log('Deleted all books in DB');
};

const createSampleBooks = async (app: INestApplication) => {
  console.log('STARTED: createSampleBooks');
  const booksService = app.get<BooksService>(BooksService);
  // ! Please use this only when needed along with caution ~ Sahil
  await deleteAllBooks(app);

  const { success, error } = await booksService.syncWithTheBookDb();
  if (error) {
    console.log('error?', error);
  } else {
    console.log('success?', success);
  }
};

(async () => {
  const app = await createApp();

  await createSampleBooks(app);
  await mongoose.disconnect();
  await app.close();
})();
