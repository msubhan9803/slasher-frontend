import { MovieDocument, MovieSchema } from './movie.schema';

function generateSortName(name: string, id: string) {
  return `${name.toLowerCase().replace(/a |an |the |/, '')}_${id}`;
}

function generateSortReleaseDate(releaseDate: Date, sortName: string, id: string) {
  return `${releaseDate.toISOString()}_${sortName}_${id}`;
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
      this.sortReleaseDate = generateSortReleaseDate(this.releaseDate, this.sort_name, this.id);
    } else {
      // Otherwise set sortReleaseDate to null (potentially clearing out an existing value)
      this.sortReleaseDate = null;
    }
  });

  schema.post<MovieDocument>('save', async function () {
    // If, AFTER a save, id AND startDate have values but sortStartDate does not, then this is
    // probably a first-time save and we should set the sortStartDate value based on the startDate
    // and id values.
    if (this.id?.length > 0 && this.name && !this.sort_name) {
      this.sort_name = generateSortName(this.name, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }

    // If, AFTER a save, id AND startDate AND releaseDate have values but sortReleaseDate does not,
    // then this is probably a first-time save and we should set the sortStartDate value based on
    // the startDate and id values.
    if (this.id?.length > 0 && this.name && !this.sort_name) {
      this.sortReleaseDate = generateSortReleaseDate(this.releaseDate, this.sort_name, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }
  });
}
