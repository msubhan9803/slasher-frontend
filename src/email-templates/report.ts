/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter } from './shared';

export const templateForReport = `
  ${sharedEmailHeader}
    <p>The user [[REPORTER_USERNAME]] has reported a [[REPORT_TYPE]] by [[REPORTED_USERNAME]]:</p>

    <p>[[REPORT_REASON]]</p>

    <p>
      View the Slasher admin console for more information:
      <a href="https://admin-prod.slasher.tv">https://admin-prod.slasher.tv</a>
    </p>
  ${sharedEmailFooter}
`;
