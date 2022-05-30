import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

@Schema()
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

@Schema()
export class User {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

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

  @Prop({ required: true, enum: ['1', '2'], default: 1 }) // 1 == regular user, 2 == admin
  userType: string;

  @Prop({ required: true, enum: ['0', '1', '2'], default: 0 }) // 0 == inactive, 1 == active, 2 == deactivated
  status: string;

  @Prop({ type: [DeviceSchema] })
  userDevices: Device[];

  @Prop({ trim: true, default: null })
  last_login: Date; // Device login date

  @Prop({ required: true, default: null })
  token: string;

  @Prop({ trim: true, default: '' })
  aboutMe: string;

  generateNewJwtToken(jwtSecretKey: string) {
    const jwtPayload = {
      id: this._id.toString(),
      userType: this.userType,
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
}

export const UserSchema = SchemaFactory.createForClass(User);

// NOTE: Must define instance or static methods on the UserSchema as well, otherwise they won't
// be available on the schema documents.

UserSchema.methods.generateNewJwtToken = User.prototype.generateNewJwtToken;
UserSchema.methods.addOrUpdateDeviceEntry =
  User.prototype.addOrUpdateDeviceEntry;

export type UserDocument = User & Document;
