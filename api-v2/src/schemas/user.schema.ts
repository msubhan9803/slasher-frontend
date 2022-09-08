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

@Schema({ timestamps: true })
export class User {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, trim: true })
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

  // NOTE: token is required in old API (v1),
  // but we may not need to store in in this new API (v2).
  @Prop({ default: null })
  token: string;

  @Prop({ default: null })
  passwordChangedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ required: true, default: '', trim: true })
  firstName: string;

  @Prop({ required: true, default: '', trim: true })
  securityQuestion: string;

  @Prop({ required: true, default: '', trim: true })
  securityAnswer: string;

  @Prop({ trim: true, default: null })
  resetPasswordToken: string;

  @Prop({ trim: true, default: null })
  verification_token: string; // NOTE: This is pascal_case insteaed of camelCase for old-API compatibility

  @Prop({ default: null })
  lastPasswordResetTime: number;

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
