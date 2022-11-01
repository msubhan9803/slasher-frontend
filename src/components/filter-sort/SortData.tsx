import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

interface SortDataProps {
  title?: string;
  className?: string;
  sortoptions?: OptionsProps[];
  type?: string;
  onSelect?: any;
}
interface OptionsProps {
  value: string;
  label: string;
}
const StyledStortingSelect = styled(Form)`

`;
function SortData({
  title, className, sortoptions, type, onSelect,
}: SortDataProps) {
  return (
    <StyledStortingSelect>
      <Form.Select aria-label="Default select example" onChange={(e) => onSelect(e)} className={`fs-5 shadow-none px-4 ${className}`}>
        {sortoptions && sortoptions.length > 0 && sortoptions.map(({ value, label }) => (
          type === 'sort' && (
            <option key={value} value={value}>
              {title}
              {label}
            </option>
          )
        ))}
        {type === 'select' && (
          <option defaultValue="">
            Select categories
          </option>
        )}
      </Form.Select>
    </StyledStortingSelect>
  );
}

SortData.defaultProps = {
  title: '',
  className: '',
  sortoptions: [],
  type: '',
};

export default SortData;
