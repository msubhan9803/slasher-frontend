import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getSearchUser } from '../../../api/searchUser';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import SearchHeader from '../SearchHeader';

interface SearchPeopleProps {
  id: number;
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
  const [searchPeople, setSearchPeople] = useState<SearchPeopleProps[]>();
  const searchData = () => {
    let searchUser = search;
    if (search.charAt(0) === '@') {
      searchUser = search.substring(1);
    }
    // let searchResult;
    if (searchUser && searchUser.length >= 3) {
      // searchResult = newFilter && newFilter.length > 0
      //   ? newFilter.filter((src: SearchPeopleProps) =>
      // src.name.toLowerCase().includes(searchUser))
      //   : [];
      getSearchUser(searchUser).then((res) => {
        if (res.data) {
          setSearchPeople(res.data);
        } else {
          setSearchPeople([]);
        }
      });
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchHeader
        tabKey="people"
        setSearch={setSearch}
        search={search}
        label="Enter username"
      />
      <Row className="mt-4">
        {search && search.length < 3
          && <h1 className="h3">Enter a search term into the search box above to find users by username (must enter at least 3 characters).</h1>}
        {searchPeople && (searchPeople.length > 0 ? searchPeople.map((peopleDetail) => (
          <Col md={6} key={peopleDetail.id}>
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
        )) : (
          <h2 className="h3">No users found.</h2>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default SearchPeople;
