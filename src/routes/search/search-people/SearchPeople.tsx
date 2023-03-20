import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { getSearchUser } from '../../../api/searchUser';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import SearchHeader from '../SearchHeader';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface SearchPeopleProps {
  _id: number;
  firstName: string;
  profilePic: string;
  userName: string;
}
function SearchPeople() {
  const [search, setSearch] = useState<string>('');
  const [searchPeople, setSearchPeople] = useState<SearchPeopleProps[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [loadUser, setLoadUser] = useState<boolean>(false);
  const [moreCharacters, setMoreCharacters] = useState<boolean>(false);

  const searchData = async (criteria: string) => {
    if (criteria && criteria.length >= 3) {
      await getSearchUser(criteria ? 0 : page, criteria).then((res) => {
        if (res.data && res.data.length > 0) {
          setSearchPeople(res.data);
          if (criteria) {
            setPage(1);
          } else {
            setPage(page + 1);
          }
          setLoadUser(false);
        } else {
          setSearchPeople([]);
          setNoMoreData(true);
          setLoadUser(false);
          setPage(page + 1);
        }
      });
    } else {
      setMoreCharacters(true);
      setLoadUser(false);
      setSearchPeople([]);
    }
  };

  const fetchMoreUsers = () => {
    if (page > 0) {
      getSearchUser(page, search)
        .then((res) => {
          setSearchPeople((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setPage(page + 1);
          if (res.data.length === 0) {
            setNoMoreData(true);
            setLoadUser(false);
          }
        });
    }
  };

  const handleSearch = (value: string) => {
    setLoadUser(true);
    setMoreCharacters(false);
    setNoMoreData(false);
    setSearchPeople([]);
    let searchUser = value;
    if (searchUser.charAt(0) === '@') {
      searchUser = searchUser.slice(1);
    }
    if (searchUser && searchUser.length >= 3) {
      setSearch(searchUser);
      searchData(searchUser);
    } else {
      setLoadUser(false);
      setMoreCharacters(true);
      setNoMoreData(false);
    }
    setPage(0);
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        searchPeople && searchPeople.length === 0
          ? 'No users found'
          : ''
      }
    </p>
  );

  return (
    <div>
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
          {moreCharacters
            && <h1 className="h3">Enter a search term into the search box above to find users by username (must enter at least 3 characters).</h1>}
          {searchPeople && searchPeople.length > 0 && searchPeople.map((peopleDetail) => (
            <Col md={6} key={peopleDetail._id}>
              <Link className="pb-4 d-flex align-items-center text-decoration-none" to={`/${peopleDetail.userName}`}>
                <UserCircleImage className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light" src={peopleDetail.profilePic} />
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
    </div>
  );
}

export default SearchPeople;
