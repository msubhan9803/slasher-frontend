/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter, renderEmailHtmlButtonLink } from './shared';

export const templateForEmailChangeNewAddressRecipient = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      To confirm the email address change on your Slasher account to [[NEW_EMAIL_ADDRESS]], please click the following button:
    </p>

    <p>
      ${renderEmailHtmlButtonLink('click here', '[[VERIFY_NEW_EMAIL_LINK]]')}
      <br />
      <br />
    </p>

    <p>Your email address will not be changed if you do not click the link.</p>

    <p>Thank you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
