import React, { useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { debounce } from 'lodash';
import { getSearchUser } from '../../../api/searchUser';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import SearchHeader from '../SearchHeader';

interface SearchPeopleProps {
  _id: number;
  firstName: string;
  profilePic: string;
  userName: string;
}
const StyledPeopleCircle = styled(Image)`
  border-radius: 50%;
  height: 3.125rem;
  width: 3.125rem;
`;
function SearchPeople() {
  const [search, setSearch] = useState<string>('');
  const [filteredSearch, setFilteredSearch] = useState<string>('');
  const [searchPeople, setSearchPeople] = useState<SearchPeopleProps[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [loadUser, setLoadUser] = useState<boolean>(false);

  const searchData = async (criteria: string) => {
    setLoadUser(true);
    setNoMoreData(false);
    if (criteria && criteria.length >= 3) {
      await getSearchUser(page, criteria).then((res) => {
        if (res.data && res.data.length > 0) {
          setSearchPeople((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setPage(page + 1);
          setLoadUser(false);
        } else {
          setSearchPeople([]);
          setNoMoreData(true);
          setLoadUser(false);
        }
      });
    } else {
      setLoadUser(false);
      setSearchPeople([]);
    }
  };

  const fetchMoreUsers = () => {
    if (page > 0) {
      getSearchUser(page, filteredSearch)
        .then((res) => {
          setSearchPeople((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setPage(page + 1);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        });
    }
  };

  const debouncedSearch = debounce(async (criteria: string) => {
    await searchData(criteria);
  }, 2000);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    setSearchPeople([]);
    let searchUser = value;
    if (searchUser.charAt(0) === '@') {
      searchUser = searchUser.slice(1);
    }
    setFilteredSearch(searchUser);
    debouncedSearch(searchUser);
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        searchPeople && searchPeople.length === 0
          ? 'No users found'
          : 'No more results'
      }
    </p>
  );

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchHeader
        tabKey="people"
        setSearch={handleSearch}
        search={search}
        label="Enter username"
      />
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={fetchMoreUsers}
        hasMore={!noMoreData}
        element="span"
      >
        <Row className="mt-4">
          {loadUser && <LoadingIndicator />}
          {searchPeople && searchPeople.length === 0 && search && search.length < 3
            && <h1 className="h3">Enter a search term into the search box above to find users by username (must enter at least 3 characters).</h1>}
          {searchPeople && searchPeople.length > 0 && searchPeople.map((peopleDetail) => (
            /* eslint no-underscore-dangle: 0 */
            <Col md={6} key={peopleDetail._id}>
              <Link className="pb-4 d-flex align-items-center text-decoration-none" to="/search/people">
                <StyledPeopleCircle className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light" src={peopleDetail.profilePic} />
                <div className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                  <p className="fw-bold mb-0">
                    {peopleDetail.userName}
                  </p>
                  <small className="text-light mb-0">{peopleDetail.firstName}</small>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </InfiniteScroll>
      {search && search.length >= 3 && noMoreData && renderNoMoreDataMessage()}
    </AuthenticatedPageWrapper>
  );
}

export default SearchPeople;
