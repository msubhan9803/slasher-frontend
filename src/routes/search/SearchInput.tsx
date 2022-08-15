import React, { useEffect } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from './SearchInterface';

interface SearchPropss {
  setFiltered: (val: any) => void;
  filtered: SearchProps[];
  data: SearchProps[];
  selectedTab: string;
  setMessage: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  isRedirect: boolean;
}
const SearchInputGroup = styled(InputGroup)`
  .form-control {
    border-left: .06rem solid var(--bs-input-border-color);
    border-top-right-radius: 1.56rem !important;
    border-bottom-right-radius: 1.56rem !important;
    padding: 0rem;
    flex-wrap: inherit !important;
    font-size: 0.875rem;
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
function SearchInput({
  setFiltered, filtered, data, selectedTab, setMessage, search, setSearch, isRedirect,
}: SearchPropss) {
  const searchString = (str: string) => {
    const prevFilter = filtered;
    let errMsg = 'No data Found';
    if (str) {
      const result = prevFilter.filter(
        (findHashtag: any) => findHashtag.name.toLowerCase().startsWith(str),
      );
      setFiltered(result);
      errMsg = `No ${selectedTab} found`;
    } else {
      prevFilter.length = 0;
      setFiltered(data);
    }
    setMessage(errMsg);
  };

  useEffect(() => {
    if (isRedirect === true) {
      searchString(search);
    }
  }, [isRedirect]);

  const searchData = (query: any) => {
    const searchQuery = query.target.value;
    let searchResult;
    let newMsg = 'No data Found';
    const newFilter = filtered;
    if (query.key === 'Enter') {
      if (searchQuery) {
        searchResult = newFilter.filter((src: any) => (
          src.name.toLowerCase().startsWith(searchQuery)
        ));
        setFiltered(searchResult);
        newMsg = searchResult.length === 0 ? `No ${selectedTab} found` : 'Hashtags';
      } else {
        newFilter.length = 0;
        setFiltered(data);
      }
      setMessage(newMsg);
    }
    setSearch(searchQuery);
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
