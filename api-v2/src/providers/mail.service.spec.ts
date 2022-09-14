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

  describe('#sendForgotPasswordEmail', () => {
    it('sends the correct mail details to the mail transporter', async () => {
      const email = 'example@example.com';
      const token = 'd4c70121-1f0b-4e6a-aac9-b8be3720f369';
      const mockTransporter = {
        createTransport: jest.fn(),
        sendMail: jest.fn(),
      };
      jest
        .spyOn(mailService, 'createMailTransporter')
        .mockReturnValue(mockTransporter);

      mailService.sendForgotPasswordEmail(email, token);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        {
          from: email,
          subject: 'Forgot password',
          text: `This is the forgot password email with token: ${token}`,
          to: 'example@example.com',
        },
        expect.anything(),
      );
    });
  });
});
