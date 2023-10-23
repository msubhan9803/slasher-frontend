import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UsersService } from '../../users/providers/users.service';
import { FriendsService } from '../../friends/providers/friends.service';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { FeedCommentsService } from '../../feed-comments/providers/feed-comments.service';
import { FeedLikesService } from '../../feed-likes/providers/feed-likes.service';
import { ChatService } from '../../chat/providers/chat.service';

@Processor('delete-user-data')
export class DeleteUserDataConsumer {
    constructor(
        private usersService: UsersService,
        private friendsService: FriendsService,
        private blocksService: BlocksService,
        private feedPostsService: FeedPostsService,
        private feedCommentsService: FeedCommentsService,
        private feedLikesService: FeedLikesService,
        private chatService: ChatService,
    ) { }

    @Process('delete-user-all-data')
    async deleteUserData(job: Job<any>) {
        const user = await this.usersService.findById(job.data.userId, false);

        await Promise.all([
            // Remove all friendships and pending friend requests related to this user.
            this.friendsService.deleteAllByUserId(user.id),

            // Remove all suggested friend blocks to or from this user.
            this.friendsService.deleteAllSuggestBlocksByUserId(user.id),

            // Remove all blocks to or from the user.  It's especially important to delete
            // blocks to the user because we don't want this now-deleted user showing up in other
            // users' block lists in the UI.
            this.blocksService.deleteAllByUserId(user.id),

            // Mark all posts by the deleted user as deleted
            this.feedPostsService.deleteAllPostByUserId(user.id),
            // Mark all post likes by the deleted user as deleted
            this.feedPostsService.deleteAllFeedPostLikeByUserId(user.id),
            // Mark all comments by the deleted user as deleted
            this.feedCommentsService.deleteAllCommentByUserId(user.id),
            // Mark all replies by the deleted user as deleted
            this.feedCommentsService.deleteAllReplyByUserId(user.id),

            // Mark all reply likes by the deleted user as deleted
            this.feedCommentsService.deleteAllFeedReplyLikeByUserId(user.id),
            // Mark all messages by the deleted user as deleted
            this.chatService.deleteAllMessageByUserId(user.id),
            // For any matchList where roomCategory equals MatchListRoomCategory.DirectMessage AND
            // that matchList has the deleted user in the participants array, mark the matchList as deleted.
            this.chatService.deleteAllMatchlistByUserId(user.id),
            // Delete all likes by the deleted user.  This includes: feedpostlikes, feedreplylikes,
            // likes by the user on posts, comments, and replies.
            this.feedLikesService.deleteAllFeedPostLikeByUserId(user.id),
            this.feedLikesService.deleteAllFeedReplyLikeByUserId(user.id),
        ]);
        return { success: true };
    }
}
