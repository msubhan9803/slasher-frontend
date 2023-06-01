/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter, renderEmailHtmlButtonLink } from './shared';

export const templateForEmailChangeOldAddressRecipient = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>An email address change request has been made on your Slasher account. Your Slasher account will no longer be associated with this email address.</p>

    <p>
      To cancel the email change and keep this email associated with your Slasher account, please click the following button:
    </p>

    <p>
      ${renderEmailHtmlButtonLink('cancel email change', '[[CANCEL_EMAIL_ADDRESS_CHANGE_LINK]]')}
      <br />
      <br />
    </p>

    <p>If you did not make this request:</p>

    <ol>
      <li>Click the link above to cancel the email change</li>
      <li>Sign in to your Slasher account</li>
      <li>Change your account password</li>
    </ol>

    <p>
      If you have any questions or need help, you can contact us at:
      <a style="color:#ffffff;" href="mailto:[[HELP_EMAIL]]">[[HELP_EMAIL]]</a>
    </p>

    <p>Thank you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
