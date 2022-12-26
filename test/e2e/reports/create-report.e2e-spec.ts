import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { ReportAndUnreportService } from '../../../src/reports/providers/report-and-unreports.service';
import { ReportAndUnreport, ReportAndUnreportDocument } from '../../../src/schemas/reportAndUnreport/reportAndUnreport.schema';
import { MailService } from '../../../src/providers/mail.service';

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
  let reportAndUnreportService: ReportAndUnreportService;
  let activeUserAuthToken: string;
  let reportsModel: Model<ReportAndUnreportDocument>;
  let mailService: MailService;

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
    configService = moduleRef.get<ConfigService>(ConfigService);
    reportAndUnreportService = moduleRef.get<ReportAndUnreportService>(ReportAndUnreportService);
    reportsModel = moduleRef.get<Model<ReportAndUnreportDocument>>(getModelToken(ReportAndUnreport.name));
    mailService = moduleRef.get<MailService>(MailService);

    app = moduleRef.createNestApplication();
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
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
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
    feedReply = await feedCommentsService
      .createFeedReply(
        feedComments.id,
        activeUser.id,
        feedCommentsAndReplyObject.message,
        feedCommentsAndReplyObject.images,
      );
  });

  it('should be defined', () => {
    expect(reportAndUnreportService).toBeDefined();
  });

  describe('Post /reports', () => {
    it('when report type is profile than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = user1.id;
      reportAndUnreportObject.reportType = 'profile';
      await request(app.getHttpServer())
        .post('/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const report = await reportsModel.findOne({ to: user1.id });
      expect(report.to.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        reportAndUnreportObject.reason,
      );
    });

    it('when report type is post than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedPost.id;
      reportAndUnreportObject.reportType = 'post';
      await request(app.getHttpServer())
        .post('/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedPostData = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostData.id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        reportAndUnreportObject.reason,
      );
    });

    it('when report type is comment than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedComments.id;
      reportAndUnreportObject.reportType = 'comment';
      await request(app.getHttpServer())
        .post('/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedCommentData = await feedCommentsService.findFeedComment(feedComments.id);
      expect(feedCommentData.id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        reportAndUnreportObject.reason,
      );
    });

    it('when report type is reply than expected reports response', async () => {
      jest.spyOn(mailService, 'sendReportNotificationEmail').mockImplementation();
      reportAndUnreportObject.targetId = feedReply.id;
      reportAndUnreportObject.reportType = 'reply';
      await request(app.getHttpServer())
        .post('/reports')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(reportAndUnreportObject);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id);
      expect(feedReplyData.id.toString()).toEqual(reportAndUnreportObject.targetId);
      expect(mailService.sendReportNotificationEmail).toHaveBeenCalledWith(
        reportAndUnreportObject.reportType,
        activeUser.userName,
        reportAndUnreportObject.reason,
      );
    });

    describe('Validation', () => {
      it('when profile is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'profile';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain(
          'Profile not found',
        );
      });

      it('when post is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'post';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain(
          'Post not found',
        );
      });

      it('when comment is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'comment';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain(
          'Comment not found',
        );
      });

      it('when reply is not found than expected response', async () => {
        reportAndUnreportObject.reportType = 'reply';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain(
          'Reply not found',
        );
      });

      it('targetId must be a mongodb id', async () => {
        reportAndUnreportObject.targetId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'targetId must be a mongodb id',
        );
      });

      it('check reportType must be one of the following values: profile, post, comment, reply', async () => {
        reportAndUnreportObject.reportType = 'test';
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.body.message).toContain(
          'reportType must be one of the following values: profile, post, comment, reply',
        );
      });

      it('reason is not longer than 1000 characters', async () => {
        reportAndUnreportObject.reason = new Array(1002).join('z');
        const response = await request(app.getHttpServer())
          .post('/reports')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(reportAndUnreportObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Report cannot be longer than 1,000 characters',
        );
      });
    });
  });
});
