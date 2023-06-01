import { sharedEmailHeader, sharedEmailFooter, renderEmailHtmlButtonLink } from './shared';

/* eslint-disable max-len */
export const templateForForgotPassword = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      We received a password reset request from your account.
      Please click the following button to reset your password on Slasher:
    </p>

    <p>
      ${renderEmailHtmlButtonLink('click here', '[[RESET_PASSWORD_LINK]]')}
      <br />
      <br />
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
