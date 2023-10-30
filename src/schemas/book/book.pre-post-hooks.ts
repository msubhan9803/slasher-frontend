import { BookDocument, BookSchema } from './book.schema';

function generateSortName(name: string, id: string) {
  return `${name.toLowerCase().replace(/[^\w\s]/g, '').replace(/a |an |the | /g, '')} ${id}`;
}

function generateSortPublishDate(publishDate: Date, id: string) {
  return `${publishDate.toISOString()}_${id}`;
}

// Last updated @ 29 Oct, 2023
// Average rating of books = sum_of_all_rating_in_books_colletion / total_number_of_books
const C = 0.52;
// A minimum number of ratings required for a books to be considered (you can choose a
// value based on your database size and the level of confidence you want).
const M = 2;
// r is rating of books
// v is number of ratings of books
const calculateWeightedRatingOfBook = (r: number, v: number) => (v / (v + M)) * r + (M / (v + M)) * C;
export const getSortSafeWeightedRatingOfBook = (r: number, v: number) => calculateWeightedRatingOfBook(r, v).toFixed(8);

export function generateSortRatingAndRatingUsersCountForBook(rating: number, ratingUsersCount: number, id: string) {
  const sortSafeWeightedRating = getSortSafeWeightedRatingOfBook(rating, ratingUsersCount);
  return `${sortSafeWeightedRating}_${id}`;
}

export function addPrePostHooks(schema: typeof BookSchema) {
  schema.pre<BookDocument>('save', async function () {
    // If id AND name are present, then we can use them to generate the sort_name
    if (this.id?.length > 0 && this.name) {
      this.sort_name = generateSortName(this.name, this.id);
    } else {
      // Otherwise set sort_name to null (potentially clearing out an existing value)
      this.sort_name = null;
    }

    // If id AND name AND releaseDate are present, then we can use them to generate the sortReleaseName
    if (this.id?.length > 0 && this.name && this.publishDate) {
      this.sortPublishDate = generateSortPublishDate(this.publishDate, this.id);
    } else {
      // Otherwise set sortReleaseDate to null (potentially clearing out an existing value)
      this.sortPublishDate = null;
    }

    // If id AND rating are present, then we can use them to generate the sortRating
    if (this.id?.length > 0 && typeof this.rating === 'number' && typeof this.ratingUsersCount === 'number') {
      this.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCountForBook(this.rating, this.ratingUsersCount, this.id);
    } else {
      // Otherwise set sortRating to null (potentially clearing out an existing value)
      this.sortRatingAndRatingUsersCount = null;
    }
  });

  schema.post<BookDocument>('findOneAndUpdate', async (doc: BookDocument) => {
    // eslint-disable-next-line no-param-reassign
    doc.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCountForBook(doc.rating, doc.ratingUsersCount, doc.id);
    await doc.save();
  });
  schema.post<BookDocument>('save', async function () {
    // If, AFTER a save, id AND name have values but sort_name does not, then this is
    // probably a first-time save and we should set the sort_name value based on the name
    // and id values.
    if (this.id?.length > 0 && this.name && !this.sort_name) {
      this.sort_name = generateSortName(this.name, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }

    // If, AFTER a save, sortReleaseDate is missing (and dependent fields are present), then this is
    // probably a first-time save and we should set the sortReleaseDate value based on the dependent
    // fields.
    if (this.id?.length > 0 && this.sort_name && this.publishDate && !this.sortPublishDate) {
      this.sortPublishDate = generateSortPublishDate(this.publishDate, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }

    // If, AFTER a save, sortRating is missing (and dependent fields are present), then this is
    // probably a first-time save and we should set the sortRating value based on the dependent
    // fields.
    if (this.id?.length > 0 && typeof this.rating === 'number'
      && typeof this.ratingUsersCount === 'number' && !this.sortRatingAndRatingUsersCount) {
      this.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCountForBook(this.rating, this.ratingUsersCount, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }
  });

  // post hooks for insertMany (to ensure that 'save' hooks are run after insertMany)
  schema.post<BookDocument[]>('insertMany', async (docs) => {
    if (Array.isArray(docs) && docs.length) {
      docs.map(async (singleDoc) => {
        await singleDoc.save();
      });
    } else {
      throw new Error('Book list should not be empty');
    }
  });
}
