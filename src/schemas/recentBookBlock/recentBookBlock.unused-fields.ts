import { Prop } from '@nestjs/mongoose';

export class RecentBookBlockUnusedFields {
  // This field is null 100% of the time in the database. We should be able to remove it once
  // we retire the old API.
  @Prop({ default: null })
  reasonOfReport: string;
}
