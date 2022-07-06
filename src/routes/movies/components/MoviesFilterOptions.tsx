import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Form, FormControl, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 1px solid var(--bs-input-border-color);
    border-bottom-right-radius: 30px;
    border-top-right-radius: 30px;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 30px;
  }
  svg {
    color: var(--bs-primary);
    min-width: 30px;
  }
`;
function MoviesFilterOptions() {
  const sortoptions = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'userRating', label: 'User Ratinge' },
  ];
  return (
    <Row className="d-none d-md-flex align-items-center my-4">
      <Col md={5} className="ps-0">
        <StyledInputGroup>
          <InputGroup.Text id="addon-label" className="pe-0">
            <FontAwesomeIcon icon={solid('magnifying-glass')} className="text-white" size="lg" />
          </InputGroup.Text>
          <FormControl
            placeholder="Search here..."
            addon-label="Search here..."
            aria-describedby="addon-label"
            type="text"
          />
        </StyledInputGroup>
      </Col>
      <Col md={2} className="text-center">
        <div role="button">
          Filter
          <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="text-white ms-2" size="lg" />
        </div>
      </Col>
      <Col md={5} className="text-end pe-0">
        <Form.Select aria-label="Default select example" className="shadow-none rounded-5 px-4">
          {sortoptions.map(({ value, label }) => (
            <option value={value}>
              Sort:&nbsp;
              {label}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
}

export default MoviesFilterOptions;
