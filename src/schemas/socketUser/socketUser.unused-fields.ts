import { Prop } from '@nestjs/mongoose';

export class SocketUserUnusedFields {
  // This field is always false in the database.
  // It should be removed when the old API is retired.
  @Prop({ default: false })
  deleted: false;

  // This field always holds a value of "0" in the database.
  // It should be removed when the old API is retired.
  @Prop({ default: '0' })
  status: '0';
}
