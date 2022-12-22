import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ReportType } from '../types';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) { }

  getDefaultSender() {
    return this.config.get<string>('DEFAULT_SMTP_AUTH_USER');
  }

  async sendForgotPasswordEmail(email: string, resetPasswordToken: string) {
    return this.sendEmail(
      email,
      this.getDefaultSender(),
      'Forgot password',
      `This is the forgot password email with token: ${resetPasswordToken}`,
    );
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    return this.sendEmail(
      email,
      this.getDefaultSender(),
      'Activate your Slasher account',
      // TODO: Change text below to actually include link to account activation page
      `Here is the verification token that will be used to activate your slasher account: ${verificationToken}`,
    );
  }

  async sendReportNotificationEmail(reportType: ReportType, reportedBy: string, reason: string) {
    return this.sendEmail(
      this.config.get<string>('REPORT_EMAIL_RECIPIENT'),
      this.getDefaultSender(),
      `Slasher Content Report: ${reportType}`,
      `A user (${reportedBy}) has reported a ${reportType}:\n\n${reason}\n\nView the Slasher admin console for more information.`,
    );
  }

  async sendEmail(to: string, from: string, subject: string, text: string) {
    return new Promise((resolve, reject) => {
      const mailTransporter = this.createMailTransporter();
      mailTransporter.sendMail({
        to, from, subject, text,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  createMailTransporter() {
    // We don't want to send actual emails in the test environment, so we'll use the JSON transport
    if (process.env.NODE_ENV === 'test') {
      return nodemailer.createTransport({
        jsonTransport: true,
      });
    }

    return nodemailer.createTransport({
      host: this.config.get<string>('DEFAULT_SMTP_HOST'),
      port: this.config.get<number>('DEFAULT_SMTP_PORT'),
      secure: true,
      auth: {
        user: this.getDefaultSender(),
        pass: this.config.get<string>('DEFAULT_SMTP_AUTH_PASS'),
      },
    });
  }
}
