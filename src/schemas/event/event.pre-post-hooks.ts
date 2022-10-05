import { EventDocument, EventSchema } from './event.schema';

export function addPrePostHooks(schema: typeof EventSchema) {
  schema.pre<EventDocument>('save', async function () {
    // If id and startDate are present, then we can use them to generate the sortStartDate
    if (this.id?.length > 0 && this.startDate) {
      this.sortStartDate = `${this.startDate.toISOString()}_${this._id.toString()}`;
    } else {
      // Otherwise set sortStartDate to null (potentially clearing out an existing value)
      this.sortStartDate = null;
    }
  });

  schema.post<EventDocument>('save', async function () {
    // If, AFTER a save, id and startDate have values but sortStartDate does not, then this is
    // probably a first-time save and we should set the sortStartDate value based on the startDate
    // and id values.
    if (this.id?.length > 0 && this.startDate && !this.sortStartDate) {
      this.sortStartDate = `${this.startDate.toISOString()}_${this._id.toString()}`;
      // Because this change is happening after a save, we need to trigger one additional save.
      // Be careful when saving inside the post-save hook, because a mistake here can lead to
      // an infinite loop!
      await this.save();
    }
  });
}
