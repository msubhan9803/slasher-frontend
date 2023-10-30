import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Job } from 'bull';
import { Connection } from 'mongoose';
import { userFactory } from '../../../test/factories/user.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { AppModule } from '../../app.module';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { NotificationCreationConsumer } from './notification-creation.consumer';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { NotificationType } from '../../schemas/notification/notification.enums';
import { PostType } from '../../schemas/feedPost/feedPost.enums';

describe('#notification', () => {
    let app: INestApplication;
    let connection: Connection;
    let activeUser: UserDocument;
    let usersService: UsersService;
    let feedPost: FeedPostDocument;
    let feedPostsService: FeedPostsService;
    let notificationCreationConsumer: NotificationCreationConsumer;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .compile();
        connection = await moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        notificationCreationConsumer = moduleRef.get(NotificationCreationConsumer);
        feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
        app = moduleRef.createNestApplication();
    });

    afterAll(async () => app.close());

    beforeEach(async () => {
        // Drop database so we start fresh before each test
        await clearDatabase(connection);

        // Reset sequences so we start fresh before each test
        rewindAllFactories();

        activeUser = await usersService.create(userFactory.build());
        feedPost = await feedPostsService.create(
            feedPostFactory.build(
                {
                    userId: activeUser.id,
                },
            ),
        );
    });

    describe('Successfully creates notification', () => {
        it('adds a job', async () => {
            const postTypeMessages = {
                [PostType.MovieReview]: 'liked your movie review',
                [PostType.BookReview]: 'liked your book review',
                default: 'liked your post',
            };
            const notificationData = {
                userId: activeUser.id,
                feedPostId: { _id: feedPost._id.toString() } as unknown as FeedPost,
                senderId: activeUser._id,
                allUsers: [activeUser._id as any],
                notifyType: NotificationType.UserLikedYourPost,
                notificationMsg: postTypeMessages[feedPost.postType] || postTypeMessages.default,
            };
            const response = await notificationCreationConsumer.sendNotification({ data: notificationData } as Job);
            expect(response).toEqual({ success: true });
        });
    });
});
