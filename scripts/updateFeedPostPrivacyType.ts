import { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FeedPost, FeedPostDocument } from "../src/schemas/feedPost/feedPost.schema";
import { createApp } from "./createApp";
import { ProfileVisibility } from "../src/schemas/user/user.enums";
import { FeedPostDeletionState, FeedPostPrivacyType } from "../src/schemas/feedPost/feedPost.enums";
import { User, UserDocument } from "../src/schemas/user/user.schema";

async function updateFeedpostPrivacyType(app: INestApplication) {
    const feedPostModel = app.get<Model<FeedPostDocument>>(getModelToken(FeedPost.name));
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    await feedPostModel.updateMany({}, { $set: { privacyType: FeedPostPrivacyType.Public } }, { multi: true });

    const privateUsers = await userModel.find({ profile_status: ProfileVisibility.Private }, { _id: 1 }).exec();
    await feedPostModel.updateMany(
        { userId: { $in: privateUsers } },
        { $set: { privacyType: FeedPostPrivacyType.Private } },
        { multi: true }
    )
}

(async () => {
    const app = await createApp();
    await updateFeedpostPrivacyType(app);
    app.close();
})();