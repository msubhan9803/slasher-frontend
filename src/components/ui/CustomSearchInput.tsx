import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

interface SearchProps {
  setSearch: (value: string) => void
  search: string;
  label: string;
}
const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 1px solid var(--bs-input-border-color);
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

function CustomSearchInput({ setSearch, search, label }: SearchProps) {
  return (
    <StyledInputGroup>
      <InputGroup.Text id="search" className="pe-0 border-end-0">
        <FontAwesomeIcon icon={solid('magnifying-glass')} className="text-white" size="lg" />
      </InputGroup.Text>
      <FormControl
        className="fs-5"
        placeholder={label}
        addon-label="search"
        aria-describedby="search"
        type="text"
        value={search}
        onChange={(e: any) => {
          setSearch(e.target.value);
        }}
      />
    </StyledInputGroup>
  );
}

export default CustomSearchInput;
