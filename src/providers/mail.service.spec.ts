import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../app.module';
import { MailService } from './mail.service';

describe('MailService', () => {
  let app: INestApplication;
  let connection: Connection;
  let mailService: MailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    mailService = moduleRef.get<MailService>(MailService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('#sendEmail', () => {
    it('sends the correct mail fields to the mail transporter', async () => {
      const from = 'exampleFrom@example.com';
      const to = 'exampleTo@example.com';
      const subject = 'This is the email subject.';
      const text = 'This is the email text.';
      const mockTransporter = {
        createTransport: jest.fn(),
        sendMail: jest.fn(),
      };
      (jest.spyOn(mailService, 'createMailTransporter') as jest.Mock).mockReturnValue(mockTransporter);

      mailService.sendEmail(to, from, subject, text);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          to,
          from,
          subject,
          text,
        },
        expect.anything(),
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

      mailService.sendForgotPasswordEmail(to, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Forgot password',
        `This is the forgot password email with token: ${token}`,
      );
    });
  });

  describe('#sendVerificationEmail', () => {
    it('sends the correct mail details to the sendEmail function', async () => {
      const to = 'example@example.com';
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      jest
        .spyOn(mailService, 'sendEmail')
        .mockReturnValue(Promise.resolve(null));

      mailService.sendVerificationEmail(to, token);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        to,
        mailService.getDefaultSender(),
        'Activate your Slasher account',
        `Here is the verification token that will be used to activate your slasher account: ${token}`,
      );
    });
  });
});
