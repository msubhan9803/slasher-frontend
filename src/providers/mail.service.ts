import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { DateTime } from 'luxon';
import { ReportType } from '../types';
import { escapeStringForRegex } from '../utils/escape-utils';
import { templateForForgotPassword } from '../email-templates/forgot-password';
import { templateForNewAccountVerification } from '../email-templates/new-account-verification';
import { templateForEmailChangeNewAddressRecipient } from '../email-templates/email-change-new-address-recipient';
import { templateForEmailChangeOldAddressRecipient } from '../email-templates/email-change-old-address-recipient';
import { templateForEventSuggestionSuggester } from '../email-templates/event-suggestion-suggester';
import { templateForEventSuggestionReviewer } from '../email-templates/event-suggestion-reviewer';
import { templateForReport } from '../email-templates/report';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) { }

  getDefaultSenderEmailAddress() {
    return this.config.get<string>('DEFAULT_SMTP_AUTH_USER');
  }

  getFormattedDefaultSenderForFromField() {
    return `Slasher <${this.getDefaultSenderEmailAddress()}>`;
  }

  getEventReviewEmailReceiver() {
    return this.config.get<string>('EVENT_REVIEW_EMAIL');
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

  async sendVerificationEmail(email: string, userId: string, verificationToken: string) {
    const htmlToSend = this.processEmailTemplate(templateForNewAccountVerification, {
      FRONTEND_URL: this.config.get<string>('FRONTEND_URL'),
      EMAIL_VERIFICATION_LINK: `${this.config.get<string>('FRONTEND_URL')}/app/`
        + `activate-account?userId=${encodeURIComponent(userId)}`
        + `&token=${encodeURIComponent(verificationToken)}`,
    });
    return this.sendEmail(
      email,
      this.getFormattedDefaultSenderForFromField(),
      'Activate Your Slasher Account',
      htmlToSend,
      'html',
    );
  }

  async sendForgotPasswordEmail(email: string, resetPasswordToken: string) {
    const htmlToSend = this.processEmailTemplate(templateForForgotPassword, {
      HELP_EMAIL: this.config.get<string>('HELP_EMAIL'),
      RESET_PASSWORD_LINK: `${this.config.get<string>('FRONTEND_URL')}/app/`
        + `reset-password?email=${encodeURIComponent(email)}`
        + `&resetPasswordToken=${encodeURIComponent(resetPasswordToken)}`,
    });
    return this.sendEmail(
      email,
      this.getFormattedDefaultSenderForFromField(),
      'Slasher - Password Reset',
      htmlToSend,
      'html',
    );
  }

  /**
   * Sends an email to the submitter of the event, and also to an admin who can review the event.
   */

  async sendEventSuggestionEmails(
    suggesterEmail: string,
    eventCategory: string,
    eventName: string,
    eventStartDate: Date,
    eventEndDate: Date,
  ) {
    const emailPromises = [];

    const eventSuggestionSuggesterMessageHtml = this.processEmailTemplate(templateForEventSuggestionSuggester, {});
    emailPromises.push(this.sendEmail(
      suggesterEmail,
      this.getFormattedDefaultSenderForFromField(),
      'Slasher - Event Suggestion Received',
      eventSuggestionSuggesterMessageHtml,
      'html',
    ));

    const eventSuggestionReviewerMessageHtml = this.processEmailTemplate(templateForEventSuggestionReviewer, {
      EVENT_CATEGORY: eventCategory,
      EVENT_NAME: eventName,
      EVENT_START_DATE: DateTime.fromJSDate(eventStartDate).setZone('utc').toLocaleString(DateTime.DATE_FULL),
      EVENT_END_DATE: DateTime.fromJSDate(eventEndDate).setZone('utc').toLocaleString(DateTime.DATE_FULL),
    });
    emailPromises.push(this.sendEmail(
      this.getEventReviewEmailReceiver(),
      this.getFormattedDefaultSenderForFromField(),
      'Event Suggestion',
      eventSuggestionReviewerMessageHtml,
      'html',
    ));

    return Promise.all(emailPromises);
  }

  /**
   * * Sends an email to the new email address that requests confirmation and also
   * sends an email to the old email address notifying of the change.
   * @param firstName
   * @param oldEmail
   * @param newEmail
   * @param emailChangeToken
   * @returns Promise<any[]> A promise to await, which will resolve when the emails have sent successfully.
   */
  async sendEmailChangeConfirmationEmails(userId: string, oldEmail: string, newEmail: string, confirmToken: string, revertToken: string) {
    const emailPromises = [];

    const oldEmailAddressMessageHtml = this.processEmailTemplate(templateForEmailChangeOldAddressRecipient, {
      HELP_EMAIL: this.config.get<string>('HELP_EMAIL'),
      CANCEL_EMAIL_ADDRESS_CHANGE_LINK: `${this.config.get<string>('FRONTEND_URL')}/app/email-change/revert?`
        + `userId=${encodeURIComponent(userId)}`
        + `&token=${encodeURIComponent(revertToken)}`,
    });
    emailPromises.push(this.sendEmail(
      oldEmail,
      this.getFormattedDefaultSenderForFromField(),
      'Your Slasher Account Email Has Been Changed',
      oldEmailAddressMessageHtml,
      'html',
    ));

    const newEmailAddressMessageHtml = this.processEmailTemplate(templateForEmailChangeNewAddressRecipient, {
      NEW_EMAIL_ADDRESS: newEmail,
      VERIFY_NEW_EMAIL_LINK: `${this.config.get<string>('FRONTEND_URL')}/app/email-change/confirm?`
        + `userId=${encodeURIComponent(userId)}`
        + `&token=${encodeURIComponent(confirmToken)}`,
    });
    emailPromises.push(this.sendEmail(
      newEmail,
      this.getFormattedDefaultSenderForFromField(),
      'Confirm Your Slasher Email Change',
      newEmailAddressMessageHtml,
      'html',
    ));

    return Promise.all(emailPromises);
  }

  async sendReportNotificationEmail(
    reportType: ReportType,
    reporterUserName: string,
    reportedUserName: string,
    reportReason: string,
  ) {
    const htmlToSend = this.processEmailTemplate(templateForReport, {
      REPORT_TYPE: reportType,
      REPORTER_USERNAME: reporterUserName,
      REPORTED_USERNAME: reportedUserName,
      REPORT_REASON: reportReason,
    });
    return this.sendEmail(
      this.config.get<string>('REPORT_EMAIL_RECIPIENT'),
      this.getFormattedDefaultSenderForFromField(),
      `Slasher Report: ${reportType}`,
      htmlToSend,
      'html',
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
        user: this.getDefaultSenderEmailAddress(),
        pass: this.config.get<string>('DEFAULT_SMTP_AUTH_PASS'),
      },
    });
  }
}
