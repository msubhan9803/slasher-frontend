import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { FeedPostsService } from './feed-posts.service';
import { HashtagFollowsService } from '../../hashtag-follows/providers/hashtag-follows.service';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { userFactory } from '../../../test/factories/user.factory';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { PostAccessService } from './post-access.service';
import { HashtagService } from '../../hashtag/providers/hashtag.service';

describe('PostAccessService', () => {
    let app: INestApplication;
    let connection: Connection;
    let usersService: UsersService;
    let activeUser: UserDocument;
    let user0: UserDocument;
    let feedPost: FeedPostDocument;
    let feedPost1: FeedPostDocument;
    let hashtagFollowsService: HashtagFollowsService;
    let feedPostsService: FeedPostsService;
    let postAccessService: PostAccessService;
    let hashtagService: HashtagService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        connection = moduleRef.get<Connection>(getConnectionToken());
        usersService = moduleRef.get<UsersService>(UsersService);
        feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
        postAccessService = moduleRef.get<PostAccessService>(PostAccessService);
        hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);
        hashtagService = moduleRef.get<HashtagService>(HashtagService);
        app = moduleRef.createNestApplication();
        configureAppPrefixAndVersioning(app);
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    beforeEach(async () => {
        // Drop database so we start fresh before each test
        await clearDatabase(connection);

        // Reset sequences so we start fresh before each test
        rewindAllFactories();
        activeUser = await usersService.create(userFactory.build());
        user0 = await usersService.create(userFactory.build());
        feedPost = await feedPostsService.create(feedPostFactory.build({
            userId: activeUser._id,
            hashtags: [],
        }));
        feedPost1 = await feedPostsService.create(feedPostFactory.build({
            userId: activeUser._id,
            hashtags: ['test', 'good'],
        }));
        const hashtag = await hashtagService.createOrUpdateHashtags(['nature']);
        await hashtagFollowsService.create({
            userId: user0._id,
            hashTagId: hashtag[0]._id,
        });
    });

    describe('#checkAccessPostService', () => {
        it('gives the expected response when hashtag is not found in feedpost', async () => {
            await expect(
                postAccessService.checkAccessPostService(user0, feedPost.hashtags),
            ).rejects.toMatchObject({
                message: 'You can only interact with posts of friends.',
                status: HttpStatus.FORBIDDEN,
            });
        });

        it('gives the expected response when hashtag is found in feedpost but user does not follow it', async () => {
            await expect(
                postAccessService.checkAccessPostService(user0, feedPost1.hashtags),
            ).rejects.toMatchObject({
                message: 'You can only interact with posts of friends.',
                status: HttpStatus.FORBIDDEN,
            });
        });
    });
});
