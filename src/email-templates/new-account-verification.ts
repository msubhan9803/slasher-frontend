import { sharedEmailHeader, sharedEmailFooter } from './shared';

/* eslint-disable max-len */
export const templateForNewAccountVerification = `
  ${sharedEmailHeader}
    <p style="font-size:24px;">Hello!</p>

    <p>
      To activate your Slasher account, please click the following link to confirm your email address:
      <a style="color:#ffffff;" href="[[EMAIL_VERIFICATION_LINK]]">click here</a>
    </p>

    <p>We look forward to you being a part of our community! We've got such sights to show you!</p>

    <p>
      You can login to Slasher at: <a style="color:#ffffff;" href="https://www.slasher.tv">www.slasher.tv</a>
      <br />
      or
      <br />
      Download the Slasher app at:
      <br />
      <a style="color:#ffffff;" href="https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en">https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en</a>
      <br />
      <br />
      <a style="color:#ffffff;" href="http://itunes.apple.com/app/id1458216326">http://itunes.apple.com/app/id1458216326</a>
    </p>

    <p>Thank you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
