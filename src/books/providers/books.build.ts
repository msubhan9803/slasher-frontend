import { BookActiveStatus, BookType } from '../../schemas/book/book.enums';
import { BookDocument } from '../../schemas/book/book.schema';
import { BookFromOpenLibrary } from '../../types';
import { createPublishDateForOpenLibrary } from '../../utils/date-utils';

export const buildBook = (
  i: number,
  booksFromOpenLibrary: BookFromOpenLibrary[],
  keyData: any,
  editionKeyData: any,
) => {
  const book: Partial<BookDocument> = {
    type: BookType.OpenLibrary,
    status: BookActiveStatus.Active, // books from OpenLibrary are always set to Active when created
  };

  // From `searchBooksData` API
  book.bookId = booksFromOpenLibrary[i].key;
  book.coverEditionKey = booksFromOpenLibrary[i].cover_edition_key;
  book.author = booksFromOpenLibrary[i]?.author_name ?? [];
  // From `keyData` API
  if (keyData) {
    book.description = keyData.data?.description?.value ?? keyData.data?.description;
  }
  // From `editionKeyData` API
  if (editionKeyData) {
    book.name = editionKeyData.data.title;
    book.numberOfPages = editionKeyData.data.number_of_pages;
    book.publishDate = createPublishDateForOpenLibrary(editionKeyData.data.publish_date);
    book.isbnNumber = [];
    if (editionKeyData.data.isbn_13) {
      book.isbnNumber.push(...editionKeyData.data.isbn_13);
    }
    if (editionKeyData.data.isbn_10) {
      book.isbnNumber.push(...editionKeyData.data.isbn_10);
    }
  }
  return book;
};
