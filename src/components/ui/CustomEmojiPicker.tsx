import React, { useEffect, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Emoji {
  native: string
}
interface Props {
  handleEmojiSelect: (value: Emoji) => void;
  isReply?: boolean;
}

function CustomEmojiPicker({ handleEmojiSelect, isReply }: Props) {
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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isReply]);
  return (
    <Picker data={data} onEmojiSelect={handleEmojiSelect} perLine={perLine} previewPosition="none" />
  );
}
CustomEmojiPicker.defaultProps = {
  isReply: false,
};
export default CustomEmojiPicker;
