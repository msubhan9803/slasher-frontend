import { Factory } from 'fishery';
import { ObjectId } from 'mongoose';
import { UserSetting } from '../../src/schemas/userSetting/userSetting.schema';
type UserTransientParams = {
  userId: ObjectId;
};
export const userSettingFactory = Factory.define<Partial<UserSetting>, UserTransientParams>(
  ({ transientParams}) => new UserSetting({
    userId: transientParams.userId,
    onboarding_completed: true,
    dating_got_a_match: 1,
    dating_message_received: 1,
    friends_got_a_match: 0,
    friends_message_received: 1,
    message_board_like_your_post: 1,
    message_board_reply_your_post:1,
    message_board_new_post_on_thread: 1,
    feed_mention_on_post_comment_reply:1,
    feed_post_like:1,
    feed_comment_on_post:1
   })
);
