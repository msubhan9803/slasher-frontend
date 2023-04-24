import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { forgotPasswordEmailTemplate, verificationEmailTemplate } from '../email-templates';
import { ReportType } from '../types';
import { escapeStringForRegex } from '../utils/escape-utils';
import { relativeToFullImagePath } from '../utils/image-utils';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) { }

  getDefaultSender() {
    return this.config.get<string>('DEFAULT_SMTP_AUTH_USER');
  }

  // eslint-disable-next-line class-methods-use-this
  processEmailTemplate(template: string, context: { [key: string]: string }) {
    let output = template;
    Object.entries(context).forEach(([key, val]) => {
      output = output.replace(
        new RegExp(escapeStringForRegex(`[[${key}]]`), 'g'),
        val,
      );
    });
    return output;
  }

  async sendVerificationEmail(firstName: string, email: string, verificationToken: string) {
    const htmlToSend = this.processEmailTemplate(verificationEmailTemplate, {
      ReceiverName: firstName,
      ImageBaseUrl: relativeToFullImagePath(this.config, ''),
      FRONTEND_URL: this.config.get<string>('FRONTEND_URL'),
      HELP_EMAIL: this.config.get<string>('HELP_EMAIL'),
      EmailVerificationPath: `/app/activate-account?email=${encodeURIComponent(email)}`
        + `&verificationToken=${encodeURIComponent(verificationToken)}`,
    });
    return this.sendEmail(
      email,
      this.getDefaultSender(),
      'Welcome to Slasher',
      htmlToSend,
      'html',
    );
  }

  async sendForgotPasswordEmail(firstName: string, email: string, resetPasswordToken: string) {
    const htmlToSend = this.processEmailTemplate(forgotPasswordEmailTemplate, {
      ReceiverName: firstName,
      ImageBaseUrl: relativeToFullImagePath(this.config, ''),
      FRONTEND_URL: this.config.get<string>('FRONTEND_URL'),
      HELP_EMAIL: this.config.get<string>('HELP_EMAIL'),
      ResetPasswordPath: `/app/reset-password?email=${encodeURIComponent(email)}`
        + `&resetPasswordToken=${encodeURIComponent(resetPasswordToken)}`,
    });
    return this.sendEmail(
      email,
      this.getDefaultSender(),
      'Slasher - Forgot password',
      htmlToSend,
      'html',
    );
  }

  async sendReportNotificationEmail(reportType: ReportType, reportedBy: string, reason: string) {
    return this.sendEmail(
      this.config.get<string>('REPORT_EMAIL_RECIPIENT'),
      this.getDefaultSender(),
      `Slasher Content Report: ${reportType}`,
      `A user (${reportedBy}) has reported a ${reportType}:\n\n${reason}\n\nView the Slasher admin console for more information.`,
      'plain',
    );
  }

  async sendEmail(to: string, from: string, subject: string, text: string, textType: 'plain' | 'html') {
    return new Promise((resolve, reject) => {
      const mailTransporter = this.createMailTransporter();
      const mailOpts: Mail.Options = { to, from, subject };
      if (textType === 'html') {
        mailOpts.html = text;
      } else {
        mailOpts.text = text;
      }

      mailTransporter.sendMail(mailOpts, (err, data) => {
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
