import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

interface SearchProps {
  setSearch: (value: string) => void;
  search: string;
  label: string;
}
const StyledSearchInput = styled(InputGroup)`
  .form-control {
    border-right: 1px solid var(--bs-input-border-color);
    border-bottom-left-radius: 1.875rem;
    border-top-left-radius: 1.875rem;
    padding-left: 1rem;
  }
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.875rem;
  }
`;

function CustomSearchInput({ label, setSearch, search }: SearchProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  useEffect(() => {
    setSearchValue(search);
  }, [search]);
  const handleSearch = (e: any) => {
    if (e.keyCode === 13 || e.type === 'click') {
      setSearch(searchValue);
    }
  };
  return (
    <StyledSearchInput>
      <FormControl
        placeholder={label}
        addon-label="search"
        aria-describedby="search"
        type="text"
        value={searchValue}
        onChange={(e: any) => {
          setSearchValue(e.target.value);
        }}
        onKeyUp={handleSearch}
        aria-label="search"
      />
      <InputGroup.Text id="search" className="ps-0 border-start-0">
        <FontAwesomeIcon
          role="button"
          icon={solid('magnifying-glass')}
          className="text-primary"
          size="lg"
          onClick={handleSearch}
        />
      </InputGroup.Text>
    </StyledSearchInput>
  );
}

export default CustomSearchInput;
