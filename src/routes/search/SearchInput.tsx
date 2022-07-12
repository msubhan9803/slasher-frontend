import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const SearchInputGroup = styled(InputGroup)`
  .form-control {
    border-left: .06rem solid var(--bs-input-border-color);
    border-top-right-radius: 1.56rem !important;
    border-bottom-right-radius: 1.56rem !important;
    padding: 0rem;
    flex-wrap: inherit !important;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.56rem;
    width: 2.5rem
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.87rem;
  }
`;
function SearchInput() {
  const [search, setSearch] = useState<string>('');
  const searchData = (query: any) => {
    // const searchQuery = query.target.value;
    // let searchResult;
    // let newMsg = 'Hashtags';
    // const newFilter = hashtags;
    // if (query.key === 'Enter') {
    //   if (searchQuery) {
    //     searchResult = newFilter.filter((src: string) =>
    // src.toLowerCase().startsWith(searchQuery));
    //     setFiltered(searchResult);
    //     newMsg = searchResult.length === 0 ? 'No hashtag found' : 'Hashtags';
    //   } else {
    //     newFilter.length = 0;
    //     setFiltered(newFilter);
    //   }
    //   setMessage(newMsg);
    // }
    // setSearch(searchQuery);
  };
  return (
    <div>
      <SearchInputGroup className="mb-3">
        <InputGroup.Text id="search" className="px-2">
          <FontAwesomeIcon icon={solid('magnifying-glass')} size="sm" className="text-white" />
        </InputGroup.Text>
        <FormControl
          placeholder="Search..."
          aria-label="search"
          aria-describedby="search"
          value={search}
          onChange={searchData}
          onKeyDown={searchData}
          className="ps-1"
        />
      </SearchInputGroup>
    </div>
  );
}

export default SearchInput;
