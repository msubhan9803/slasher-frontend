import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  title?: string;
  className?: string;
}
const StyledStortingSelect = styled(Form)`
  .form-select {
    font-size: 0.875rem;
  }
`;
function MoviesSort({ title, className }: Props) {
  const sortoptions = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'userRating', label: 'User Ratinge' },
  ];
  return (
    <StyledStortingSelect>
      <Form.Select aria-label="Default select example" className={`shadow-none px-4 ${className}`}>
        {sortoptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {title}
            {label}
          </option>
        ))}
      </Form.Select>
    </StyledStortingSelect>
  );
}

MoviesSort.defaultProps = {
  title: '',
  className: '',
};

export default MoviesSort;
