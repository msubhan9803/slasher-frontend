/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { ConnectionStates, Model } from 'mongoose';
import { createApp } from './createApp';
import { BooksService } from '../src/books/providers/books.service';
import { Book, BookDocument } from '../src/schemas/book/book.schema';
import { BookUserStatus } from '../src/schemas/bookUserStatus/bookUserStatus.schema';

// Run this file via below command:
// NODE_ENV=development npx ts-node ./scripts/createSampleBooks.ts

const deleteAllBooks = async (app: INestApplication) => {
  const booksModel = app.get<Model<BookDocument>>(getModelToken(Book.name));
  // Delete all documents in `books` collection
  await booksModel.deleteMany({});
  console.log('Deleted all books in DB');
};
const deleteAllBooksUserStatus = async (app: INestApplication) => {
  const bookUserStatus = app.get<Model<BookUserStatus>>(getModelToken(BookUserStatus.name));
  // Delete all documents in `books` collection
  await bookUserStatus.deleteMany({});
  console.log('Deleted all bookUserStatus in DB');
};

const createSampleBooks = async (app: INestApplication) => {
  console.log('STARTED: createSampleBooks');
  const booksService = app.get<BooksService>(BooksService);
  // ! Please use this only when needed along with caution
  await deleteAllBooks(app);
  // ! Please use this only when needed along with caution
  await deleteAllBooksUserStatus(app);

  const { success, error } = await booksService.syncWithOpenLibrary();
  if (error) {
    console.log('error?', error);
  } else {
    console.log('success?', success);
  }
};

(async () => {
  const app = await createApp();

  await createSampleBooks(app);

  const isConnectionDisconnectedAlready = mongoose.connection.readyState === ConnectionStates.disconnected;
  if (!isConnectionDisconnectedAlready) {
    await mongoose.disconnect();
    await app.close();
  } else {
    process.exit(0);
  }
})();
