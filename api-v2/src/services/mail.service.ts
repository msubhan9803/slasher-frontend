import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendForgotPasswordEmail(email: string, token: string) {
    return new Promise((resolve, reject) => {
      const mailTransporter = nodemailer.createTransport({
        host: this.config.get<string>('DEFAULT_SMTP_HOST'),
        port: this.config.get<number>('DEFAULT_SMTP_PORT'),
        secureConnection: true,
        auth: {
          user: this.config.get<string>('DEFAULT_SMTP_AUTH_USER'),
          pass: this.config.get<string>('DEFAULT_SMTP_AUTH_PASS'),
        },
      });
      const mailDetails = {
        to: email,
        from: this.config.get<string>('DEFAULT_SMTP_AUTH_USER'),
        subject: 'Forgot password',
        text: `This is the forgot password email with token: ${token}`,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
