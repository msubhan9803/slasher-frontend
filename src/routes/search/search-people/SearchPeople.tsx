import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import SearchHeader from '../SearchHeader';
import { people } from '../SearchResult';

interface SearchPeopleProps {
  id: number;
  name: string;
  profileImage: string;
  email: string;
}
const StyledPeopleCircle = styled(Image)`
  border-radius: 50%;
  height: 3.125rem;
  width: 3.125rem;
`;
function SearchPeople() {
  const [search, setSearch] = useState<string>('');
  const [searchPeople, setSearchPeople] = useState<SearchPeopleProps[]>(people);
  const searchData = () => {
    let searchResult;
    const newFilter = people;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchPeopleProps) => src.name.toLowerCase().includes(search))
        : [];
      setSearchPeople(searchResult);
    } else {
      setSearchPeople(people);
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
      />
      <Row>
        {searchPeople.map((peopleDetail) => (
          <Col md={6} key={peopleDetail.id}>
            <div className="py-4 d-flex align-items-center">
              <StyledPeopleCircle className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light" src={peopleDetail.profileImage} />
              <div className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                <p className="fw-bold mb-0">
                  {peopleDetail.name}
                </p>
                <small className="text-light mb-0">{peopleDetail.email}</small>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default SearchPeople;
