import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
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
function MoviesFilterOptions({
  showKeys, setShowKeys, setFilteredMovies, myMovies,
}: any) {
  const sortoptions = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'userRating', label: 'User Ratinge' },
  ];
  const [search, setSearch] = useState<string>('');
  const searchData = (searchQuery: string) => {
    let searchResult;
    const newFilter = myMovies;
    if (searchQuery) {
      searchResult = newFilter.filter((src: any) => src.name.toLowerCase().startsWith(searchQuery));
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(myMovies);
    }
    setSearch(searchQuery);
  };
  return (
    <>
      <Row className="d-none d-md-flex align-items-center my-4">
        <Col md={5} className="ps-0">
          <StyledInputGroup>
            <InputGroup.Text id="search" className="pe-0">
              <FontAwesomeIcon icon={solid('magnifying-glass')} className="text-white" size="lg" />
            </InputGroup.Text>
            <FormControl
              placeholder="Search here..."
              addon-label="search"
              aria-describedby="search"
              type="text"
              value={search}
              onChange={(e: any) => {
                searchData(e.target.value);
              }}
            />
          </StyledInputGroup>
        </Col>
        <Col md={2} className="text-center">
          <Button
            onClick={() => setShowKeys(!showKeys)}
            className={`align-items-center bg-transparent border-0 d-flex justify-content-center px-0 shadow-none w-100 ${showKeys ? 'text-primary' : 'text-white'}`}
          >
            Filter
            <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
          </Button>
        </Col>
        <Col md={5} className="text-end pe-0">
          <Form.Select aria-label="Default select example" className="shadow-none rounded-5 px-4">
            {sortoptions.map(({ value, label }) => (
              <option key={value} value={value}>
                Sort:&nbsp;
                {label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className="d-md-none align-items-center justify-content-center my-4">
        <Col md={2} className="text-center">
          <Button
            onClick={() => setShowKeys(!showKeys)}
            className={`align-items-center bg-transparent border-0 d-flex justify-content-center px-0 shadow-none w-100 ${showKeys ? 'text-primary' : 'text-white'}`}
          >
            Sort/Filter
            <FontAwesomeIcon icon={solid('arrow-down-wide-short')} className="ms-2" size="lg" />
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default MoviesFilterOptions;
