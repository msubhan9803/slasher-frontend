import React from 'react';
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
    decryptMessage(escapeHtmlSpecialCharacters(reformattedMessage)),
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
