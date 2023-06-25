/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserUnusedFields } from './user.unused-fields';
import { UserType, ActiveStatus, ProfileVisibility } from './user.enums';

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

@Schema({ timestamps: true })
export class User extends UserUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  // This is temporary, but required during the beta release phase.  It allows us to block sign-in
  // on the new beta website until we release the site to the public.
  @Prop({ default: false })
  betaTester: boolean;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({
    required: true, trim: true,
  })
  userName: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  deleted: boolean;

  @Prop({ required: true, default: false })
  userSuspended: boolean;

  @Prop({ required: true, default: false })
  userBanned: boolean;

  @Prop({ trim: true, default: null })
  last_login: Date; // Device login date

  @Prop({ default: null })
  passwordChangedAt: Date;

  @Prop({ required: true, default: '', trim: true })
  firstName: string;

  @Prop({ default: null })
  dob: Date;

  @Prop({ default: null })
  previousUserName: string;

  // TODO: Eventually make the field required (@Prop({required: true})), once the old API has been retired.
  // Can't make it required now because that would stop users of the old API from logging in.
  @Prop({ default: '', trim: true })
  securityQuestion: string;

  // TODO: Eventually make the field required (@Prop({required: true})), once the old API has been retired.
  // Can't make it required now because that would stop users of the old API from logging in.
  @Prop({ default: '', trim: true })
  securityAnswer: string;

  @Prop({ trim: true, default: null })
  resetPasswordToken: string;

  @Prop({ trim: true, default: null })
  verification_token: string; // NOTE: This is pascal_case insteaed of camelCase for old-API compatibility

  @Prop({ default: null })
  lastPasswordResetTime: Date;

  @Prop({
    required: true,
    enum: [UserType.Regular, UserType.Admin],
    default: UserType.Regular,
  })
  userType: UserType;

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

  @Prop({ default: 'noUser.jpg', trim: true })
  profilePic: string;

  @Prop({ default: null, trim: true })
  coverPhoto: string;

  @Prop({ default: '', trim: true })
  aboutMe: string;

  @Prop({ default: null })
  registrationIp: string;

  @Prop({ default: null })
  lastSignInIp: string;

  @Prop({ default: ProfileVisibility.Public })
  profile_status: ProfileVisibility;

  // The number of new notifications that have been received since the user looked at their notifications page
  @Prop({ default: 0 })
  newNotificationCount: number;

  // The unique list of conversation ids where the user has received new messages since looking at their messages page
  @Prop({ default: [] })
  newConversationIds: string[];

  // The number of new notifications that have been received since the user looked at their friend requests page
  @Prop({ default: 0 })
  newFriendRequestCount: number;

  @Prop({ trim: true, default: null })
  unverifiedNewEmail: string;

  @Prop({ trim: true, default: null })
  emailChangeToken: string;

  // This is so we have an audit trail after email address changes, in case someone's account is ever compromised
  @Prop({ default: [] })
  old_email_arr: string[];

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<User>) {
    super();

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

  generatedUpdatedDeviceEntryList(newDeviceEntry: Device) {
    // Duplicate existing Device entries into a local variable
    const newDeviceEntries = this.userDevices.map((existingEntry) => ({ ...(existingEntry as any).toObject() }));

    // Check if a device already exists with the given device_id.
    const searchResult = newDeviceEntries.find(
      (device) => device.device_id === newDeviceEntry.device_id,
    );
    // If so, update that entry and immediately return
    if (searchResult) {
      Object.assign(searchResult, newDeviceEntry);
      return newDeviceEntries;
    }

    newDeviceEntries.sort((a, b) => {
      if (!a.login_date) { return -1; } // if a is null, then b is later
      if (!b.login_date) { return 1; } // if b is null, then a is later
      return a.login_date.getTime() - b.login_date.getTime();
    }); // sort devices by ascending login_date

    if (newDeviceEntries.length >= 30) {
      newDeviceEntries.shift(); // remove earliest login_date item
    }

    // Add new entry.
    newDeviceEntries.push(newDeviceEntry);

    return newDeviceEntries;
  }

  setUnhashedPassword(unhashedPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(unhashedPassword, salt);
    this.passwordChangedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  {
    _id: 1, userName: 1, deleted: 1, status: 1,
  },
);
UserSchema.index(
  {
    email: 1, resetPasswordToken: 1,
  },
);
UserSchema.index(
  {
    email: 1, verification_token: 1,
  },
);
// To support case-insensitive userName search
UserSchema.index(
  { userName: 1 },
  {
    name: 'caseInsensitiveUserName',
    collation: { locale: 'en', strength: 2 },
  },
);
// To support case-insensitive email search
UserSchema.index(
  { email: 1 },
  {
    name: 'caseInsensitiveEmail',
    collation: { locale: 'en', strength: 2 },
  },
);

// NOTE: Must define instance or static methods on the UserSchema as well, otherwise they won't
// be available on the schema documents.
UserSchema.methods.generateNewJwtToken = User.prototype.generateNewJwtToken;
UserSchema.methods.generatedUpdatedDeviceEntryList = User.prototype.generatedUpdatedDeviceEntryList;
UserSchema.methods.setUnhashedPassword = User.prototype.setUnhashedPassword;

export type UserDocument = HydratedDocument<User>;
