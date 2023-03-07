import { Factory } from 'fishery';
import { Book } from '../../src/schemas/book/book.schema';
import {
  BookStatus,
  BookDeletionState,
} from '../../src/schemas/book/book.enums';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const booksFactory = Factory.define<Partial<Book>>(
  () => new Book({
      name: 'Young Goodman Brown',
      status: BookStatus.Active,
      deleted: BookDeletionState.NotDeleted,
    }),
);

addFactoryToRewindList(booksFactory);
