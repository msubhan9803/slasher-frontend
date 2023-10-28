import { MovieDocument, MovieSchema } from './movie.schema';

// We pad zeroes such that there are total 11 digits (i.e, 10 Billion in number)
export const padNumberWithZeros = (number: number) => {
  const hasDecimals = number % 1 !== 0;
  if (hasDecimals) { return '0000000000'; /* 11 digits */ }
  const numberString = number.toString();
  // Calculate the number of zeros needed to make it 10 digits
  const zerosNeeded = 10 - numberString.length;
  // Create a string of leading zeros
  const zeroPadding = '0'.repeat(zerosNeeded);
  // Concatenate the zeros with the number
  const paddedNumberString = zeroPadding + numberString;
  return paddedNumberString;
};

function generateSortName(name: string, id: string) {
  return `${name.toLowerCase().replace(/a |an |the | /g, '')} ${id}`;
}

function generateSortReleaseDate(releaseDate: Date, id: string) {
  return `${releaseDate.toISOString()}_${id}`;
}

// ! TODO-SAHIL: !deprecate this after SD-1556 is marked "DONE".
function generateSortRating(rating: number, id: string) {
  return `${rating}_${id}`;
}

export function generateSortRatingAndRatingUsersCount(rating: number, ratingUsersCount: number, id: string) {
  return [rating.toFixed(1), padNumberWithZeros(ratingUsersCount), id].join('_');
}

export function addPrePostHooks(schema: typeof MovieSchema) {
  schema.pre<MovieDocument>('save', async function () {
    // If id AND name are present, then we can use them to generate the sort_name
    if (this.id?.length > 0 && this.name) {
      this.sort_name = generateSortName(this.name, this.id);
    } else {
      // Otherwise set sort_name to null (potentially clearing out an existing value)
      this.sort_name = null;
    }

    // If id AND name AND releaseDate are present, then we can use them to generate the sortReleaseName
    if (this.id?.length > 0 && this.name && this.releaseDate) {
      this.sortReleaseDate = generateSortReleaseDate(this.releaseDate, this.id);
    } else {
      // Otherwise set sortReleaseDate to null (potentially clearing out an existing value)
      this.sortReleaseDate = null;
    }

    // If id AND rating are present, then we can use them to generate the sortRating
    if (this.id?.length > 0 && typeof this.rating === 'number') {
      // ! TODO-SAHIL: !deprecate this after SD-1556 is marked "DONE".
      this.sortRating = generateSortRating(this.rating, this.id);
      // this.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCount(this.rating, this.ratingUsersCount, this.id);
    } else {
      // ! TODO-SAHIL: !deprecate this after SD-1556 is marked "DONE".
      // Otherwise set sortRating to null (potentially clearing out an existing value)
      this.sortRating = null;
      this.sortRatingAndRatingUsersCount = null;
    }
  });

  schema.post<MovieDocument>('findOneAndUpdate', async function (doc: MovieDocument) {
    // ! TODO-SAHIL: !deprecate this after SD-1556 is marked "DONE".
    // eslint-disable-next-line no-param-reassign
    doc.sortRating = generateSortRating(this.rating, this.id);
    // eslint-disable-next-line no-param-reassign
    // doc.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCount(doc.rating, doc.ratingUsersCount, doc.id);
    await doc.save();
  });
  schema.post<MovieDocument>('save', async function () {
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
    if (this.id?.length > 0 && this.sort_name && this.releaseDate && !this.sortReleaseDate) {
      this.sortReleaseDate = generateSortReleaseDate(this.releaseDate, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }

    // If, AFTER a save, sortRating is missing (and dependent fields are present), then this is
    // probably a first-time save and we should set the sortRating value based on the dependent
    // fields.
    if (this.id?.length > 0 && typeof this.rating === 'number' && !this.sortRating) {
      // ! TODO: !deprecate this ASAP  ~ Sahil
      this.sortRating = generateSortRating(this.rating, this.id);
      // this.sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCount(this.rating, this.ratingUsersCount, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }
  });

  // post hooks for insertMany (to ensure that 'save' hooks are run after insertMany)
  schema.post<MovieDocument[]>('insertMany', async (docs) => {
    if (Array.isArray(docs) && docs.length) {
      docs.map(async (singleDoc) => {
        await singleDoc.save();
      });
    } else {
      throw new Error('Movies list should not be empty');
    }
  });
}
