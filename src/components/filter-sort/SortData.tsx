import React from 'react';
import { Form } from 'react-bootstrap';

interface SortDataProps {
  title?: string;
  className?: string;
}
function SortData({ title, className }: SortDataProps) {
  const sortoptions = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'userRating', label: 'User Rating' },
  ];
  return (
    <Form>
      <Form.Select aria-label="Default select example" className={`fs-5 shadow-none px-4 ${className}`}>
        {sortoptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {title}
            {label}
          </option>
        ))}
      </Form.Select>
    </Form>
  );
}

SortData.defaultProps = {
  title: '',
  className: '',
};

export default SortData;
