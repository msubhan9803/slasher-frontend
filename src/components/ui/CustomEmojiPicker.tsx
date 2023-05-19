import React, { useEffect, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Emoji {
  native: string
}
interface Props {
  handleEmojiSelect: (value: Emoji) => void
}

function CustomEmojiPicker({ handleEmojiSelect }: Props) {
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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <Picker data={data} onEmojiSelect={handleEmojiSelect} perLine={perLine} previewPosition="none" />
  );
}

export default CustomEmojiPicker;
