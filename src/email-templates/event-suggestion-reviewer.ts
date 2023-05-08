/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter } from './shared';

export const templateForEventSuggestionReviewer = `
  ${sharedEmailHeader}
    <p style="font-size:24px;">Dear Admin,</p>
    <p>You have received a new event suggestion.</p>
    <p>Category: [[EVENT_CATEGORY]]</p>
    <p>Name: [[EVENT_NAME]]</p>
    <p>Start Date: [[EVENT_START_DATE]]</p>
    <p>End Date: [[EVENT_END_DATE]]</p>
    <p>
      Please review it at:
      <a href="https://admin-prod.slasher.tv">https://admin-prod.slasher.tv</a>
    </p>
  ${sharedEmailFooter}
`;
