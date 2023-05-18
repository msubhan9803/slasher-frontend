import { sharedEmailHeader, sharedEmailFooter, renderTextWithInlineButtonLinkAsTable } from './shared';

/* eslint-disable max-len */
export const templateForNewAccountVerification = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    ${renderTextWithInlineButtonLinkAsTable('Click the button to activate your Slasher account:', 'Click here', '[[EMAIL_VERIFICATION_LINK]]')}

    <p>We look forward to you being a part of our community. We've got such sights to show you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
