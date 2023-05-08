import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { clearDatabase } from '../../test/helpers/mongo-helpers';
import { AppModule } from '../app.module';
import { ReportType } from '../types';
import { configureAppPrefixAndVersioning } from '../utils/app-setup-utils';
import { MailService } from './mail.service';
import { rewindAllFactories } from '../../test/helpers/factory-helpers.ts';

describe('MailService', () => {
  let app: INestApplication;
  let connection: Connection;
  let mailService: MailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    mailService = moduleRef.get<MailService>(MailService);

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
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('#processEmailTemplate', () => {
    it('performs the expected variable replacement', () => {
      const template = '<div>Hello [[Name]]. This is a [[Adjective]] test. [not-double-brackets here]\nDid it work?</div>';
      const context = { Name: 'Someone', Adjective: 'great' };
      const expected = '<div>Hello Someone. This is a great test. [not-double-brackets here]\nDid it work?</div>';
      expect(mailService.processEmailTemplate(template, context)).toBe(expected);
    });
  });

  describe('#sendEmail', () => {
    it('sends the correct mail fields to the mail transporter', async () => {
      const from = 'exampleFrom@example.com';
      const to = 'exampleTo@example.com';
      const subject = 'This is the email subject.';
      // const textType = 'plain';
      const mockTransporter = {
        createTransport: jest.fn(),
        sendMail: jest.fn().mockImplementation((opts, callback) => { callback(null, { fakeData: 'fake' }); }),
      };
      (jest.spyOn(mailService, 'createMailTransporter') as jest.Mock).mockReturnValue(mockTransporter);

      // Plain text email
      const text = 'This is the email text.';
      await mailService.sendEmail(to, from, subject, text, 'plain');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          to,
          from,
          subject,
          text,
        },
        expect.anything(),
      );

      // Html email
      const html = '<div>This is the email text.</div>';
      await mailService.sendEmail(to, from, subject, html, 'html');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          to,
          from,
          subject,
          html,
        },
        expect.anything(),
      );
    });
  });

  describe('#sendVerificationEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const to = 'example@example.com';
      const userId = new Types.ObjectId().toString();
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendVerificationEmail(to, userId, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Activate Your Slasher Account',
        expect.stringContaining(`userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`),
        'html',
      );
    });
  });

  describe('#sendForgotPasswordEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const to = 'example@example.com';
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendForgotPasswordEmail(to, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Slasher - Password Reset',
        expect.stringContaining(token),
        'html',
      );
    });
  });

  describe('#sendEventSuggestionEmails', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const suggesterEmail = 'suggester@example.com';
      const eventCategory = 'Conventions';
      const eventName = 'Great event';
      const eventStartDate = DateTime.fromISO('2023-06-01T00:00:00.000Z').toJSDate();
      const eventEndDate = DateTime.fromISO('2023-06-02T23:59:59.000Z').toJSDate();

      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendEventSuggestionEmails(suggesterEmail, eventCategory, eventName, eventStartDate, eventEndDate);

      // Expect email sent to suggester
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        suggesterEmail,
        mailService.getDefaultSender(),
        'Slasher - Event Suggestion Received',
        expect.stringContaining('Your event suggestion has been received.'),
        'html',
      );

      // Expect email sent to admin
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        mailService.getEventReviewEmailReceiver(),
        mailService.getDefaultSender(),
        'Event Suggestion',
        expect.stringContaining(eventName),
        'html',
      );
    });
  });

  describe('#sendEmailChangeConfirmationEmails', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const userId = new Types.ObjectId().toString();
      const oldEmail = 'old@example.com';
      const newEmail = 'new@example.com';
      const confirmToken = uuidv4();
      const revertToken = uuidv4();

      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendEmailChangeConfirmationEmails(userId, oldEmail, newEmail, confirmToken, revertToken);

      // Expect email sent to oldEmail
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        oldEmail,
        mailService.getDefaultSender(),
        'Your Slasher Account Email Has Been Changed',
        expect.stringContaining(revertToken),
        'html',
      );

      // Expect email sent to newEmail
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        newEmail,
        mailService.getDefaultSender(),
        'Confirm Your Slasher Email Change',
        expect.stringContaining(confirmToken),
        'html',
      );
    });
  });

  describe('#sendReportNotificationEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const to = 'example-report-recipient@example.com';
      const reportType: ReportType = 'profile';
      const reporterUserName = 'ReporterUser';
      const reportedUserName = 'ReportedUser';
      const reportReason = 'This content shocked my sensibilities.';

      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendReportNotificationEmail(reportType, reporterUserName, reportedUserName, reportReason);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        `Slasher Report: ${reportType}`,
        expect.stringContaining(`The user ${reporterUserName} has reported a ${reportType} by ${reportedUserName}`),
        'html',
      );
    });
  });
});
