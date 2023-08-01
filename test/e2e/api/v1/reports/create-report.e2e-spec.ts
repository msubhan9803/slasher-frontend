import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { ReportAndUnreportService } from '../../../../../src/reports/providers/report-and-unreports.service';
import { ReportAndUnreport, ReportAndUnreportDocument } from '../../../../../src/schemas/reportAndUnreport/reportAndUnreport.schema';
import { MailService } from '../../../../../src/providers/mail.service';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { feedRepliesFactory } from '../../../../factories/feed-reply.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { RssFeedProviderActiveStatus } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';

describe('Report And Unreport (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsService: FeedCommentsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let reportAndUnreportService: ReportAndUnreportService;
  let activeUserAuthToken: string;
  let reportsModel: Model<ReportAndUnreportDocument>;
  let mailService: MailService;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this create reports description 1',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this create reports description 2',
      },
    ],
    message: 'Hello Test Message',
  };

  const reportAndUnreportObject = {
    targetId: '634fc8986a5897b88a2d9718',
    reportType: 'testtype',
    reason: 'the report and unreport reason',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    reportAndUnreportService = moduleRef.get<ReportAndUnreportService>(ReportAndUnreportService);
    reportsModel = moduleRef.get<Model<ReportAndUnreportDocument>>(getModelToken(ReportAndUnreport.name));
    mailService = moduleRef.get<MailService>(MailService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedComments;
  let feedReply;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser.id,
        },
      ),
    );

    feedComments = await feedCommentsService.createFeedComment(
      feedCommentsFactory.build(
        {
          userId: activeUser._id,
          feedPostId: feedPost.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );
    feedReply = await feedCommentsService.createFeedReply(
      feedRepliesFactory.build(
        {
          userId: activeUser._id,
          feedCommentId: feedComments.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );
  });

  it('should be defined', () => {
    expect(reportAndUnreportService).toBeDefined();
  });

  describe('POST /api/v1/reports', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/reports').expect(HttpStatus.UNAUTHORIZED);
    });

    it('when report type is profile than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = user1.id;
      reportAndUnreportObject.reportType = 'profile';
      const reponse = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const report = await reportsModel.findOne({ to: user1.id });
      expect(report.to.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        user1.userName,
        reportAndUnreportObject.reason,
      );
      expect(reponse.body).toEqual({ success: true });
    });

    it('when report type is post than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedPost.id;
      reportAndUnreportObject.reportType = 'post';
      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedPostData = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostData._id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        (feedPostData.userId as unknown as UserDocument).userName,
        reportAndUnreportObject.reason,
      );
      expect(response.body).toEqual({ success: true });
    });

    it('when report type is rss news feed post than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      const rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
        status: RssFeedProviderActiveStatus.Active,
      }));
      const rssFeedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
            rssfeedProviderId: rssFeedProviderData.id,
          },
        ),
      );
      reportAndUnreportObject.targetId = rssFeedPost.id;
      reportAndUnreportObject.reportType = 'post';
      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedPostData = await feedPostsService.findById(rssFeedPost.id, false);
      expect(feedPostData._id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        (feedPostData.rssfeedProviderId as unknown as RssFeedProvider).title,
        reportAndUnreportObject.reason,
      );
      expect(response.body).toEqual({ success: true });
    });

    it('when report type is comment than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedComments.id;
      reportAndUnreportObject.reportType = 'comment';
      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedCommentData = await feedCommentsService.findFeedComment(feedComments.id, true);
      expect(feedCommentData.id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        (feedCommentData.userId as unknown as UserDocument).userName,
        reportAndUnreportObject.reason,
      );
      expect(response.body).toEqual({ success: true });
    });

    it('when report type is reply than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedReply.id;
      reportAndUnreportObject.reportType = 'reply';
      const response = await request(app.getHttpServer())
        .post('/api/v1/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id, true);
      expect(feedReplyData.id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        (feedReplyData.userId as unknown as UserDocument).userName,
        reportAndUnreportObject.reason,
      );
      expect(response.body).toEqual({ success: true });
    });

    describe('Validation', () => {
      it('when profile is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'profile';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Profile not found' });
      });

      it('when post is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'post';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Post not found' });
      });

      it('when comment is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'comment';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Comment not found' });
      });

      it('when reply is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'reply';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Reply not found' });
      });

      it('targetId must be a mongodb id', async () => {
        reportAndUnreportObject.targetId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['targetId must be a mongodb id'],
          statusCode: 400,
        });
      });

      it('check reportType must be one of the following values: profile, post, comment, reply', async () => {
        reportAndUnreportObject.reportType = 'test';
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'targetId must be a mongodb id',
            'reportType must be one of the following values: profile, post, comment, reply',
          ],
          statusCode: 400,
        });
      });

      it('reason is not longer than 1000 characters', async () => {
        reportAndUnreportObject.reason = new Array(1002).join('z');
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'targetId must be a mongodb id',
            'reportType must be one of the following values: profile, post, comment, reply',
            'Report cannot be longer than 1,000 characters',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
