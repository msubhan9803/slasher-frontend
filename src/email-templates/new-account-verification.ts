import {
  sharedEmailHeader, sharedEmailFooter, renderEmailHtmlButtonLink,
} from './shared';

/* eslint-disable max-len */
export const templateForNewAccountVerification = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      Click the button to activate your Slasher account:
      ${renderEmailHtmlButtonLink('click here', '[[EMAIL_VERIFICATION_LINK]]')}
    </p>

    <p>We look forward to you being a part of our community. We've got such sights to show you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
