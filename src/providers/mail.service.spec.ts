import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
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

  describe('#sendForgotPasswordEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const firstName = 'Laszlo';
      const to = 'example@example.com';
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendForgotPasswordEmail(firstName, to, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Slasher - Forgot password',
        expect.stringContaining(token),
        'html',
      );
    });
  });

  describe('#sendVerificationEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const firstName = 'Laszlo';
      const to = 'example@example.com';
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendVerificationEmail(firstName, to, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Welcome to Slasher',
        expect.stringContaining(token),
        'html',
      );
    });
  });

  describe('#sendReportNotificationEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const to = 'example-report-recipient@example.com';
      const reportType: ReportType = 'profile';
      const reportingUserName = 'ExampleUser';
      const reportReason = 'This content shocked my sensibilities.';

      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      await mailService.sendReportNotificationEmail(reportType, reportingUserName, reportReason);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        `Slasher Content Report: ${reportType}`,
        `A user (${reportingUserName}) has reported a ${reportType}:\n\n${reportReason}\n\n`
        + 'View the Slasher admin console for more information.',
        'plain',
      );
    });
  });
});
