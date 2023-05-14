/* eslint-disable max-len */

import { sharedEmailHeader, sharedEmailFooter } from './shared';

export const templateForEventSuggestionSuggester = `
  ${sharedEmailHeader}
    <p>Hello!</p>
    <p>Your event suggestion has been received. Thank you!</p>
    <br />
    <p>Slasher Events Support</p>
  ${sharedEmailFooter}
`;
