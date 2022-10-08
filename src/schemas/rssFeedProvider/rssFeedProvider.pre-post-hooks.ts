import { RssFeedProviderDocument, RssFeedProviderSchema } from './rssFeedProvider.schema';

function generateSortTitle(title: string, id: string) {
  return `${title.toLowerCase().replace(/a |an |the |/, '')}_${id}`;
}

export function addPrePostHooks(schema: typeof RssFeedProviderSchema) {
  schema.pre<RssFeedProviderDocument>('save', async function () {
    // If id AND title are present, then we can use them to generate the sortTitle
    if (this.id?.length > 0 && this.title) {
      this.sortTitle = generateSortTitle(this.title, this.id);
    } else {
      // Otherwise set sortTitle to null (potentially clearing out an existing value)
      this.sortTitle = null;
    }
  });

  schema.post<RssFeedProviderDocument>('save', async function () {
    // If, AFTER a save, id AND startDate have values but sortStartDate does not, then this is
    // probably a first-time save and we should set the sortStartDate value based on the startDate
    // and id values.
    if (this.id?.length > 0 && this.title && !this.sortTitle) {
      this.sortTitle = generateSortTitle(this.title, this.id);
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }
  });
}
