import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 0.063rem solid var(--bs-input-border-color);
    border-bottom-right-radius: 1.875rem;
    border-top-right-radius: 1.875rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.875rem;
  }
`;
interface Props {
  setFilteredMovies: (value: MoviesProps[]) => void
  myMovies: MoviesProps[];
}
interface MoviesProps {
  id: number;
  image: string;
  name: string;
  year: string;
  liked: boolean;
}
function MoviesSearch({ setFilteredMovies, myMovies }: Props) {
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
    <StyledInputGroup className="d-none d-lg-flex">
      <InputGroup.Text id="search" className="pe-0 border-end-0">
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
  );
}

export default MoviesSearch;
