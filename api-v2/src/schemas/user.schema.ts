/* eslint-disable max-lines */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

export enum ActiveStatus {
  Inactive = '0',
  Active = '1',
  Deactivated = '2',
}

export enum UserType {
  Regular = '1',
  Admin = '2',
}

@Schema({ toJSON: { virtuals: true } })
export class Device {
  @Prop({ trim: true, default: '' })
  device_token: string;

  @Prop({ trim: true, default: '' })
  device_type: string;

  @Prop({ trim: true, default: '' })
  app_version: string;

  @Prop({ trim: true, default: '' })
  device_version: string;

  @Prop({ trim: true, default: null })
  login_date: Date;

  @Prop({ trim: true, default: '' })
  device_id: string;
}
const DeviceSchema = SchemaFactory.createForClass(Device);

// TODO: If the images field in the User schema ends up not being used,
// this Image class (and the ImageSchema) should be deleted.
@Schema({ toJSON: { virtuals: true } })
export class Image {
  @Prop({ trim: true, default: null })
  image_path: string;
}
const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ timestamps: true })
export class User {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ required: true, trim: true })
  userName: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  phoneNumber: string;

  // NOT USED
  @Prop({ default: 'noUser.jpg', trim: true })
  profilePic: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  gender: string;

  // NOT USED
  @Prop({ default: null, trim: true })
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

  @Prop({ required: true, default: false })
  deleted: boolean;

  @Prop({ required: true, default: false })
  userSuspended: boolean;

  // NOT USED
  @Prop({ default: null })
  suspendedUpto: Date; // time when suspension will be over

  // NOT USED
  @Prop({ default: 0 })
  suspensionDuration: number; // total suspension hours

  // NOT USED
  @Prop({ default: null })
  lastSuspenedId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, default: false })
  userBanned: boolean;

  // NOT USED
  @Prop({ default: null })
  bannedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: 0 })
  unreadCount: number;

  // NOT USED
  @Prop({ default: 0 })
  profile_status: number;

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

  // '1' == regular user, '2' == admin
  // Note: It's unfortunate that these are strings rather than numbers, but we need to keep them
  // as strings in the database to be compatible with the old API.
  @Prop({
    required: true,
    enum: [UserType.Regular, UserType.Admin],
    default: UserType.Regular,
  })
  userType: UserType;

  // '0' == inactive, '1' == active, '2' == deactivated
  // Note: It's unfortunate that these are strings rather than numbers, but we need to keep them
  // as strings in the database to be compatible with the old API.
  @Prop({
    required: true,
    enum: [
      ActiveStatus.Inactive,
      ActiveStatus.Active,
      ActiveStatus.Deactivated,
    ],
    default: ActiveStatus.Inactive,
  })
  status: ActiveStatus;

  @Prop({ type: [DeviceSchema] })
  userDevices: Device[];

  @Prop({ trim: true, default: null })
  last_login: Date; // Device login date

  // NOT USED
  @Prop({ default: null })
  token: string;

  // NOT USED
  @Prop({ default: null })
  dob: Date;

  @Prop({ default: null })
  passwordChangedAt: Date;

  @Prop({ required: true, default: '', trim: true })
  firstName: string;

  // NOT USED
  @Prop({ default: '', trim: true })
  lastName: string;

  // NOT USED
  @Prop({ default: '', trim: true })
  aboutMe: string;

  @Prop({ required: true, default: '', trim: true })
  securityQuestion: string;

  @Prop({ required: true, default: '', trim: true })
  securityAnswer: string;

  @Prop({ trim: true, default: null })
  resetPasswordToken: string;

  @Prop({ trim: true, default: null })
  verification_token: string; // NOTE: This is pascal_case insteaed of camelCase for old-API compatibility

  // NOT USED
  @Prop({ default: false })
  is_email_verified: boolean;

  // NOT USED
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

  @Prop({ default: null })
  lastPasswordResetTime: string;

  // NOT USED
  @Prop({ default: null, lowercase: true, trim: true })
  temp_email: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  temp_email_verification_token: string;

  // NOT USED
  @Prop({ default: [] })
  old_email_arr: string[];

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

  @Prop({ default: 0 })
  suspended_created_at: number;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<User>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }

  generateNewJwtToken(jwtSecretKey: string) {
    const jwtPayload = {
      userId: this._id.toString(),
      userType: this.userType,
      passwordChangedAt: this.passwordChangedAt?.toISOString(),
    };

    return jwt.sign(jwtPayload, jwtSecretKey);
  }

  addOrUpdateDeviceEntry(deviceEntry: Device) {
    this.userDevices;

    // Check if a device already exists with the given device_id.
    const searchResult = this.userDevices.find(
      (device) => device.device_id === deviceEntry.device_id,
    );

    // If so, update it
    if (searchResult) {
      Object.assign(searchResult, deviceEntry);
      return;
    }

    // If not, add a new entry.
    this.userDevices.push(deviceEntry);
  }

  setUnhashedPassword(unhashedPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(unhashedPassword, salt);
    this.passwordChangedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for collection

// To support case-insensitive userName search
UserSchema.index(
  { userName: 1 },
  { name: 'caseInsensitiveUserName', collation: { locale: 'en', strength: 2 } },
);

// To support case-insensitive email search
UserSchema.index(
  { email: 1 },
  { name: 'caseInsensitiveEmail', collation: { locale: 'en', strength: 2 } },
);

// NOTE: Must define instance or static methods on the UserSchema as well, otherwise they won't
// be available on the schema documents.

UserSchema.methods.generateNewJwtToken = User.prototype.generateNewJwtToken;
UserSchema.methods.addOrUpdateDeviceEntry =
  User.prototype.addOrUpdateDeviceEntry;
UserSchema.methods.setUnhashedPassword = User.prototype.setUnhashedPassword;

export type UserDocument = User & Document;
