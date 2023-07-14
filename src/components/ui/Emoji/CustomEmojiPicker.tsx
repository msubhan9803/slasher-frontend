import React, { useEffect, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from './customEmojiData.json';

export interface Emoji {
  native: string
}

interface Props {
  handleEmojiSelect: (emoji: Emoji) => void;
  onClickOutside?: () => void;
  onEscapeKeyPress?: () => void;
  autoFocus?: boolean;
  isReply?: boolean;
}

function CustomEmojiPicker({
  handleEmojiSelect, onClickOutside, onEscapeKeyPress, autoFocus, isReply,
}: Props) {
  const [perLine, setPerLine] = useState(7);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 500) {
        if (isReply) {
          setPerLine(5);
        } else {
          setPerLine(6);
        }
      } else {
        setPerLine(9);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onEscapeKeyPress?.(); }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    // Passing 3rd param true to use event capturing rather than bubbling, so the event is not
    // consumed when this emoji picker's text input has focus.
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Passing 3rd param true to match addEventListener.
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [onEscapeKeyPress, isReply]);
  return (
    <Picker
      data={data}
      onEmojiSelect={handleEmojiSelect}
      onClickOutside={() => { onClickOutside?.(); }}
      perLine={perLine}
      previewPosition="none"
      autoFocus={autoFocus}
    />
  );
}

CustomEmojiPicker.defaultProps = {
  onClickOutside: undefined,
  onEscapeKeyPress: undefined,
  autoFocus: false,
  isReply: false,
};

export default CustomEmojiPicker;
