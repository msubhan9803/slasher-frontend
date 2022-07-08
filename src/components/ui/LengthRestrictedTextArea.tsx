import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  contentDetail: string;
  placeholder?: string;
  maxLength: number;
  setContentDetail: (value: string) => void;
}
function LengthRestrictedTextArea({
  contentDetail, placeholder, maxLength, setContentDetail,
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
        rows={10}
        as="textarea"
        value={contentDetail}
        onChange={handleMessageChange}
        placeholder={placeholder}
      />
      <Form.Text className="float-end">
        {`${charCount}/${maxLength} characters`}
      </Form.Text>
      <div className="clearfix" />
    </>
  );
}
LengthRestrictedTextArea.defaultProps = {
  placeholder: 'Type here...',
};
export default LengthRestrictedTextArea;
