import React from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  title?: string;
  className?: string;
}
function MoviesSort({ title, className }: Props) {
  const sortoptions = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'userRating', label: 'User Ratinge' },
  ];
  return (
    <Form>
      <Form.Select aria-label="Default select example" className={`shadow-none px-4 ${className}`}>
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

MoviesSort.defaultProps = {
  title: '',
  className: '',
};

export default MoviesSort;
