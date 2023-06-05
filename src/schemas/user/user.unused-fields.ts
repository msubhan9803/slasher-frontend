/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';

export class UserUnusedFields {
  // NOT USED
  @Prop({ default: null, trim: true })
  phoneNumber: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  gender: string;

  // NOTE: Old app login requires facebook value to be '' for user to log in.
  // NOTE: This field is ONLY used by the old app, and can be deleted when the old api is retired.
  @Prop({ default: '', trim: true })
  facebook: string;

  // NOT USED
  @Prop({ default: '', trim: true })
  backup_facebook_id: string;

  // NOT USED
  @Prop({ default: '', trim: true })
  fb_email: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  instagram: string;

  // NOT USED
  @Prop({ default: null })
  suspendedUpto: Date; // time when suspension will be over

  // NOT USED
  @Prop({ default: 0 })
  suspensionDuration: number; // total suspension hours

  // NOT USED
  @Prop({ default: null })
  lastSuspenedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null })
  bannedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: 0 })
  unreadCount: number;

  // NOT USED
  // TODO: if we use this, probably more useful to store date of
  // agreement rather than boolean of agreement.
  @Prop({ default: false })
  termCondition: boolean;

  // NOT USED
  // TODO: if we use this, probably more useful to store date of
  // agreement rather than boolean of agreement.
  @Prop({ default: false })
  commStandard: boolean;

  // NOT USED
  @Prop({ required: true, default: false })
  userBlocked: boolean;

  // NOT USED
  @Prop({ default: null })
  token: string;

  // NOT USED
  @Prop({ default: '', trim: true })
  lastName: string;

  // NOT USED
  @Prop({ default: false })
  is_email_verified: boolean;

  // Note: Don't use this field in this app.  Currently not clear what it actually does.
  // See: profile_status field instead.
  @Prop({ default: false })
  profileStatus: boolean;

  // NOT USED
  @Prop({ default: false })
  datingStatus: boolean;

  // NOT USED
  @Prop({ default: false })
  friendsStatus: boolean;

  // NOT USED
  @Prop({ default: false })
  networkStatus: boolean;

  // NOT USED
  @Prop({ default: [] })
  profiles: string[];

  // NOT USED
  @Prop({ default: 0 })
  postCount: number;

  // NOT USED
  @Prop({ default: 0 })
  batchCount: number;

  // NOT USED
  @Prop({ ref: 'relations', default: null })
  defaultId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, lowercase: true, trim: true })
  temp_email: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  temp_email_verification_token: string;

  // NOT USED
  @Prop({ default: 0 })
  temp_email_verification_token_exp: number;

  /**************************
   * Ban and suspend fields *
   **************************/

  // NOT USED
  @Prop({ type: [ImageSchema] })
  images: Image[];

  // NOT USED
  @Prop({ default: null, trim: true })
  note: string;

  // NOT USED
  @Prop({ default: 0 })
  ban_created_at: number;

  // NOT USED
  @Prop({ default: 0 })
  suspended_created_at: number;
}
