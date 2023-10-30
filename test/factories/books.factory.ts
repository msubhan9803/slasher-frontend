import { Factory } from 'fishery';
import { Book } from '../../src/schemas/book/book.schema';
import {
  BookActiveStatus,
  BookDeletionState,
  BookType,
} from '../../src/schemas/book/book.enums';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

const randomName = Math.random().toString(36).substring(2, 5);

export const booksFactory = Factory.define<Partial<Book>>(
  ({ sequence }) => new Book({
    name: `Book?! ${randomName}${sequence}`,
    status: BookActiveStatus.Inactive, // default status is `InActive` for bookSchema
    deleted: BookDeletionState.NotDeleted,
    coverEditionKey: 'OL11759447M',
    type: BookType.OpenLibrary,
    publishDate: new Date(),
  }),
);

addFactoryToRewindList(booksFactory);
