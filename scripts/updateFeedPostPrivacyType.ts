import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FeedPost, FeedPostDocument } from "../src/schemas/feedPost/feedPost.schema";
import { createApp } from "./createApp";
import { ProfileVisibility } from "../src/schemas/user/user.enums";
import { FeedPostPrivacyType } from "../src/schemas/feedPost/feedPost.enums";
import { User, UserDocument } from "../src/schemas/user/user.schema";

async function updateFeedpostPrivacyType(app: INestApplication) {
    const feedPostModel = app.get<Model<FeedPostDocument>>(getModelToken(FeedPost.name));
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const allUserIds = await feedPostModel.distinct("userId");

    const users = await userModel.find({
        _id: { $in: allUserIds },
        deleted: false,
        userSuspended: false,
        userBanned: false
    },
        { profile_status: 1, _id: 1 }).exec();

    const privateUsers = users.filter(user => user.profile_status === ProfileVisibility.Private).map(user => user._id);
    const publicUsers = users.filter(user => user.profile_status !== ProfileVisibility.Private).map(user => user._id);

    await Promise.all([
        feedPostModel.updateMany(
            { userId: { $in: privateUsers } },
            { $set: { privacyType: FeedPostPrivacyType.Private } },
            { multi: true }),
        feedPostModel.updateMany(
            { userId: { $in: publicUsers } },
            { $set: { privacyType: FeedPostPrivacyType.Public } },
            { multi: true })
    ])
}

(async () => {
    const app = await createApp();
    await updateFeedpostPrivacyType(app);
    app.close();
})();