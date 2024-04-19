import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { RecentMovieBlockReaction } from './recentMovieBlock.enums';
import { RecentMovieBlockUnusedFields } from './recentMovieBlock.unused-fields';
import { Movie } from '../movie/movie.schema';

@Schema({ timestamps: true })
export class RecentMovieBlock extends RecentMovieBlockUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  // The user who initiates the block
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  from: User;

  // The user who will BE blocked
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Movie.name, required: true })
  movieId: Movie;

  @Prop({
    enum: [
      RecentMovieBlockReaction.Block,
      RecentMovieBlockReaction.Unblock,
    ],
  })
  reaction: RecentMovieBlockReaction;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<RecentMovieBlock>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RecentMovieBlockSchema = SchemaFactory.createForClass(RecentMovieBlock);

RecentMovieBlockSchema.index(
  {
    from: 1, reaction: 1,
  },
);

RecentMovieBlockSchema.index(
  {
    from: 1, movieId: 1,
  },
);

export type RecentMovieBlockDocument = HydratedDocument<RecentMovieBlock>;
