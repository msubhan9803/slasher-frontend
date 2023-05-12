/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter } from './shared';

export const templateForEmailChangeNewAddressRecipient = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      To confirm the email address change on your Slasher account to [[NEW_EMAIL_ADDRESS]], please click the following link:
      <a style="color:#ffffff;" href="[[VERIFY_NEW_EMAIL_LINK]]">click here</a>
    </p>

    <p>Your email address will not be changed if you do not click the link.</p>

    <p>Thank you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
