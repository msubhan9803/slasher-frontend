import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BookUnusedFields } from './book.unused-fields';

@Schema({ timestamps: true })
export class Book extends BookUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, required: true, trim: true })
  name: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Book>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);

export type BookDocument = HydratedDocument<Book>;

BookSchema.index({
  name: 1, descriptions: 1, logo: 1, type: 1, status: 1, createdBy: 1, deleted: 1,
});
