import React from 'react';
import { Form } from 'react-bootstrap';

interface CustomSelectProps {
  options: CustomOption[],
  name: string,
  label: string
}

interface CustomOption {
  label: string,
  value: string
}

function CustomSelect({
  options,
  label,
  name,
}: CustomSelectProps) {
  return (
    <>
      <p className="m-1">{label}</p>
      <Form.Select
        name={name}
        defaultValue=""
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </>
  );
}

export default CustomSelect;
