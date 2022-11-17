import React from 'react';
import { Form } from 'react-bootstrap';

interface SortDataProps {
  title?: string;
  className?: string;
  sortoptions?: OptionsProps[];
  type?: string;
  onSelectSort?(e: React.ChangeEvent<HTMLSelectElement>): void | null;
}
interface OptionsProps {
  value: string;
  label: string;
}

function SortData({
  title, className, sortoptions, type, onSelectSort,
}: SortDataProps) {
  return (
    <Form>
      <Form.Select aria-label="Default select example" onChange={onSelectSort} className={`fs-5 shadow-none px-4 ${className}`}>
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
    </Form>
  );
}

SortData.defaultProps = {
  title: '',
  className: '',
  sortoptions: [],
  type: '',
  onSelectSort: null,
};

export default SortData;
