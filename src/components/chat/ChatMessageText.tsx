import linkifyHtml from 'linkify-html';
import React from 'react';
import { customlinkifyOpts } from '../../utils/linkify-utils';
import { newLineToBr, decryptMessage, escapeHtmlSpecialCharacters } from '../../utils/text-utils';

export interface Props {
  message: string;
  firstLineOnly?: boolean;
}

function ChatMessageText({ message, firstLineOnly }: Props) {
  let reformattedMessage = decodeURIComponent(message);

  if (firstLineOnly) {
    const indexOfFirstNewLineCharacter = reformattedMessage.indexOf('\n');
    if (indexOfFirstNewLineCharacter > -1) {
      reformattedMessage = reformattedMessage.substring(0, indexOfFirstNewLineCharacter);
    }
  }

  reformattedMessage = newLineToBr(
    // TODO: Remove use of decodeURIComponent once the old API is retired and all old messages
    // have been updated so that they're not being URI-encoded anymore. The URI-encoding is
    // either coming from the old API or more likely the iOS and Android apps.  It's not clear
    // why this is being done, sine non-URI-encoded messages seem to display without a problem.
    linkifyHtml(decryptMessage(
      escapeHtmlSpecialCharacters(reformattedMessage),
    ), customlinkifyOpts),
  );
  return (
    // eslint-disable-next-line react/no-danger
    <span dangerouslySetInnerHTML={{ __html: reformattedMessage }} />
  );
}

ChatMessageText.defaultProps = {
  firstLineOnly: false,
};

export default ChatMessageText;
