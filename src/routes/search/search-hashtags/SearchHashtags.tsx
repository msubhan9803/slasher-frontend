import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { StyledHastagsCircle } from '../component/Hashtags';
import SearchHeader from '../SearchHeader';
import { hashtags } from '../SearchResult';

interface SearchPeopleProps {
  id: number;
  hashtag: string;
  count: string;
}
function SearchHashtags() {
  const [search, setSearch] = useState<string>('');
  const [searchHashtag, setSearchHashtag] = useState<SearchPeopleProps[]>(hashtags);
  const searchData = useCallback(() => {
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
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);
  return (
    <div>
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
    </div>
  );
}

export default SearchHashtags;
