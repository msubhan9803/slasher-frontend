import { sharedEmailHeader, sharedEmailFooter } from './shared';

/* eslint-disable max-len */
export const templateForNewAccountVerification = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      Click the button to activate your Slasher account:
      <a
        style="color:#000000;background:#ff1800;border-radius:50px;text-decoration:none;padding:0.375rem .75rem;font-size:14px;font-weight:bold;"
        href="[[EMAIL_VERIFICATION_LINK]]"
      >Click here</a>
    </p>

    <p>We look forward to you being a part of our community. We've got such sights to show you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
