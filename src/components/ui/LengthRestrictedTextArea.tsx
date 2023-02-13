import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import CharactersCounter from './CharactersCounter';

interface Props {
  contentDetail: string;
  placeholder?: string;
  maxLength: number;
  setContentDetail: (value: string) => void;
  rows?: number;
}
function LengthRestrictedTextArea({
  contentDetail, placeholder, maxLength, setContentDetail, rows,
}: Props) {
  const [charCount, setCharCount] = useState(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setContentDetail(e.target.value);
  };
  return (
    <>
      <Form.Control
        maxLength={maxLength}
        rows={rows}
        as="textarea"
        value={contentDetail}
        onChange={handleMessageChange}
        placeholder={placeholder}
      />
      <CharactersCounter
        counterClass="float-end"
        charCount={charCount}
        totalChar={maxLength}
      />
      <div className="clearfix" />
    </>
  );
}
LengthRestrictedTextArea.defaultProps = {
  placeholder: 'Type here...',
  rows: 10,
};
export default LengthRestrictedTextArea;
