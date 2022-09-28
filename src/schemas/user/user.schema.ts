/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserUnusedFields } from './user.unused-fields';
import { UserType, ActiveStatus } from './user.enums';

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

  @Prop({ required: true, default: '', trim: true })
  securityQuestion: string;

  @Prop({ required: true, default: '', trim: true })
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

  addOrUpdateDeviceEntry(deviceEntry: Device) {
    // Check if a device already exists with the given device_id.
    const searchResult = this.userDevices.find(
      (device) => device.device_id === deviceEntry.device_id,
    );

    // If so, update it
    if (searchResult) {
      Object.assign(searchResult, deviceEntry);
      return;
    }

    this.userDevices.sort((a, b) => a.login_date.getTime() - b.login_date.getTime()); // sort devices by ascending login_date
    if (this.userDevices.length >= 10) {
      this.userDevices.shift(); // remove earliest login_date item
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

// NOTE: Must define instance or static methods on the UserSchema as well, otherwise they won't
// be available on the schema documents.

UserSchema.methods.generateNewJwtToken = User.prototype.generateNewJwtToken;
UserSchema.methods.addOrUpdateDeviceEntry = User.prototype.addOrUpdateDeviceEntry;
UserSchema.methods.setUnhashedPassword = User.prototype.setUnhashedPassword;

export type UserDocument = User & Document;
