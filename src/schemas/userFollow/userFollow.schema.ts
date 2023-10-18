import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class UserFollow {
    readonly _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

    @Prop()
    updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

    @Prop({ ref: User.name, required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ ref: User.name, required: true })
    followUserId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, default: true })
    pushNotifications: boolean;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow);

UserFollowSchema.index(
    {
        followUserId: 1, userId: 1,
    },
);

export type UserFollowDocument = HydratedDocument<UserFollow>;
