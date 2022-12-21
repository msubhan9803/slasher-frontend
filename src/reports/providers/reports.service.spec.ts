import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedCommentsService } from '../../feed-comments/providers/feed-comments.service';
import { ReportAndUnreportService } from './reports.service';
import { ReportReaction } from '../../schemas/reportAndUnreport/reportAndUnreport.enums';

describe('ReportAndUnreportService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsService: FeedCommentsService;
  let reportAndUnreportService: ReportAndUnreportService;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
      },
    ],
    message: 'Hello Test Message',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    reportAndUnreportService = moduleRef.get<ReportAndUnreportService>(ReportAndUnreportService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedComments;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    feedComments = await feedCommentsService
      .createFeedComment(
        feedPost.id,
        activeUser.id,
        feedCommentsAndReplyObject.message,
        feedCommentsAndReplyObject.images,
      );
    await feedCommentsService
      .createFeedReply(
        feedComments.id,
        activeUser.id,
        feedCommentsAndReplyObject.message,
        feedCommentsAndReplyObject.images,
      );
  });

  it('should be defined', () => {
    expect(ReportAndUnreportService).toBeDefined();
  });

  describe('#create', () => {
    it('creates the expected report', async () => {
      const reportAndUnreportObj = {
        from: activeUser._id,
        to: feedPost._id,
        reaction: ReportReaction.Reported,
        reasonOfReport: 'this is test reason',
      };
      const report = await reportAndUnreportService.create(reportAndUnreportObj);
      expect(report).toMatchObject(reportAndUnreportObj);
    });
  });
});
