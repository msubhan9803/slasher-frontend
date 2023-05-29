import React, { useEffect, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export interface Emoji {
  native: string
}

interface Props {
  handleEmojiSelect: (emoji: Emoji) => void;
  onClickOutside?: () => void;
  onEscapeKeyPress?: () => void;
  autoFocus?: boolean;
}

function CustomEmojiPicker({
  handleEmojiSelect, onClickOutside, onEscapeKeyPress, autoFocus,
}: Props) {
  const [perLine, setPerLine] = useState(7);
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 428) {
        setPerLine(9);
      } else {
        setPerLine(7);
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
  }, []);
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
};

export default CustomEmojiPicker;
