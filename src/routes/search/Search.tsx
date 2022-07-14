import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, FormControl, InputGroup, Row, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

interface Location {
  state : {
    hashtag : string
  }
}

const StyleTabs = styled(Tabs)`
  border-bottom: 0.188rem solid var(--bs-dark);
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    border: none;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom:  0.188rem solid var(--bs-primary);
    }
  }
`;

const StyledHastagsCircle = styled.div`
  border-radius: 50%;
  height: 3.75rem;
  width: 3.75rem;
`;

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

function Search() {
  const location = useLocation();
  const [search, setSearch] = useState<string>('');
  const hashtags = [
    'horror',
    'horrorcommunty',
    'horrorfan',
    'horrormovies',
    'horrorgram',
    'horrorlover',
    'horroraddict',
    '80sslasher',
    'horrorlife',
    'horrorgirls',
    'horrorvideo',
    'horrorshirt'];
  const [filtered, setFiltered] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('Hashtags');
  const [defaultKey, setDefaultKey] = useState<string>('users');
  const { state } = location as Location;

  const searchData = (searchQuery: string) => {
    let searchResult;
    const newFilter = hashtags;
    if (searchQuery) {
      searchResult = newFilter.filter((src: string) => src.toLowerCase().startsWith(searchQuery));
      setFiltered(searchResult);
      const newMsg = searchResult.length === 0 ? 'No hastag found' : 'Hashtags';
      setMessage(newMsg);
    } else {
      newFilter.length = 0;
      setFiltered(newFilter);
    }
    setSearch(searchQuery);
  };

  useEffect(() => {
    if (location.state) {
      setSearch(state.hashtag);
      setDefaultKey('hashtags');
    }
  }, []);

  return (
    <AuthenticatedPageWrapper>
      <SearchInputGroup className="mb-3">
        <InputGroup.Text id="search" className="px-2">
          <FontAwesomeIcon icon={solid('magnifying-glass')} size="sm" className="text-white" />
        </InputGroup.Text>
        <FormControl
          placeholder="Search..."
          aria-label="search"
          aria-describedby="search"
          value={search}
          onChange={(e: any) => {
            searchData(e.target.value);
          }}
          className="ps-1"
        />
      </SearchInputGroup>
      <StyleTabs activeKey={defaultKey} className="justify-content-between flex-nowrap">
        <Tab eventKey="users" title="People">
          People
        </Tab>
        <Tab eventKey="posts" title="Posts">
          Posts
        </Tab>
        <Tab eventKey="hashtags" title="Hashtags">
          <Row>
            {filtered.length > 0 ? (filtered.map((hastag: string) => (
              <Col md={6} lg={4} key={hastag}>
                <Row className="py-4 align-items-center">
                  <Col xs={3} sm={2} lg={4}>
                    <StyledHastagsCircle className="ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
                  </Col>
                  <Col xs={9} sm={10} md={8} className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                    <h2 className="h5 mb-0">
                      #
                      {hastag}
                    </h2>
                    <p className="small text-light mb-0">24.3M posts</p>
                  </Col>
                </Row>
              </Col>
            )))
              : (
                <h1 className="h6">{message}</h1>
              )}
          </Row>
        </Tab>
        <Tab eventKey="news" title="News">
          News
        </Tab>
        <Tab eventKey="events" title="Events">
          Events
        </Tab>
        <Tab eventKey="movies" title="Movies">
          Movies
        </Tab>
      </StyleTabs>

    </AuthenticatedPageWrapper>
  );
}

export default Search;
