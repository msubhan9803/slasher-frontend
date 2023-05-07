import { sharedEmailHeader, sharedEmailFooter } from './shared';

/* eslint-disable max-len */
export const templateForForgotPassword = `
  ${sharedEmailHeader}
    <p style="font-size:24px;">Hello!</p>

    <p>
      We received a password reset request from your account.
      Please click the following link to reset your password on Slasher:
      <a style="color:#ffffff;" href="[[RESET_PASSWORD_LINK]]">click here</a>
    </p>

    <p>
      If you did not initiate this request, you can contact us at:
      <a style="color:#ffffff;" href="mailto:[[HELP_EMAIL]]">[[HELP_EMAIL]]</a>
    </p>

    <p>Thank you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
