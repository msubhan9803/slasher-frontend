import React from 'react';
import { ignoreUsernamesLinkifyOpts } from '../../utils/linkify-utils';
import { newLineToBr, decryptMessage, escapeHtmlSpecialCharacters } from '../../utils/text-utils';
import linkifyHtml from 'linkify-html';

export interface Props {
  message: string;
  firstLineOnly?: boolean;
}

function ChatMessageText({ message, firstLineOnly }: Props) {
  let reformattedMessage = '';

  // TODO: Remove this try/catch once messages are no longer url-encoded.
  // It won't be necessary at that point.
  try {
    // TODO: Remove use of decodeURIComponent once the old Slasher iOS/Android apps are retired
    // AND all old messages have been updated so that they're not being URI-encoded anymore.
    // The URI-encoding is coming from the old API or more likely the iOS and Android apps.
    // For some reason, the old apps will crash on a message page if the messages are not
    // url-encoded (we saw this while Damon was testing on Android).
    reformattedMessage = decodeURIComponent(message);
  } catch {
    // If the message can't be url-decoded, then use the original value.
    reformattedMessage = message;
  }

  if (firstLineOnly) {
    const indexOfFirstNewLineCharacter = reformattedMessage.indexOf('\n');
    if (indexOfFirstNewLineCharacter > -1) {
      reformattedMessage = reformattedMessage.substring(0, indexOfFirstNewLineCharacter);
    }
  }

  reformattedMessage = newLineToBr(
    linkifyHtml(decryptMessage(
      escapeHtmlSpecialCharacters(reformattedMessage),
    ), ignoreUsernamesLinkifyOpts),
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
