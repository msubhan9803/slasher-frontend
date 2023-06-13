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
  z-index:0;
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.875rem;
    right: 12px;
    z-index: 9;
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
      // Hide keyboard (tested on `web-android` and `capacitor-android`)
      e.target.blur();
    }
  };
  return (
    <StyledSearchInput className="position-relative align-items-center">
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
        className="rounded-pill pe-5"
      />
      <FontAwesomeIcon
        role="button"
        icon={solid('magnifying-glass')}
        className="text-primary position-absolute"
        size="lg"
        onClick={handleSearch}
      />
    </StyledSearchInput>
  );
}

export default CustomSearchInput;
