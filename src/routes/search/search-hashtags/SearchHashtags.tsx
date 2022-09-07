import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import SearchHeader from '../SearchHeader';
import { hashtags } from '../SearchResult';

interface SearchPeopleProps {
  id: number;
  hashtag: string;
  count: string;
}
const StyledHastagsCircle = styled.div`
  border-radius: 50%;
  height: 3.125rem;
  width: 3.125rem;
`;
function SearchHashtags() {
  const [search, setSearch] = useState<string>('');
  const [searchHashtag, setSearchHashtag] = useState<SearchPeopleProps[]>(hashtags);
  const searchData = () => {
    let searchResult;
    const newFilter = hashtags;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchPeopleProps) => src.hashtag.toLowerCase().includes(search))
        : [];
      setSearchHashtag(searchResult);
    } else {
      setSearchHashtag(hashtags);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchHeader
        tabKey="hashtags"
        setSearch={setSearch}
        search={search}
      />
      <Row>
        {searchHashtag.map((hashtagDetail) => (
          <Col md={6} key={hashtagDetail.id}>
            <div className="py-4 d-flex align-items-center">
              <StyledHastagsCircle className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
              <div className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                <p className="fw-bold mb-0">
                  #
                  {hashtagDetail.hashtag}
                </p>
                <small className="text-light mb-0">{hashtagDetail.count}</small>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default SearchHashtags;
