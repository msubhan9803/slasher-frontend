/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { StyledHastagsCircle } from '../component/Hashtags';
import SearchHeader from '../SearchHeader';
import { getSearchHashtag } from '../../../api/searchHashtag';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppSelector } from '../../../redux/hooks';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';

interface SearchPeopleProps {
  _id: string;
  name: string;
  totalPost: number;
}
function SearchHashtags() {
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const location = useLocation();
  const [search, setSearch] = useState<string>(scrollPosition?.searchValue);
  const pageStateCache = (getPageStateCache(location) ?? []);
  const [searchHashtag, setSearchHashtag] = useState<SearchPeopleProps[]>(
    hasPageStateCache(location)
      ? pageStateCache : [],
  );
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [page, setPage] = useState<number>(scrollPosition?.page);
  const [loadUser, setLoadUser] = useState<boolean>(false);
  const [additionalSearchHashtag, setAdditionalSearchHashtag] = useState<boolean>(false);
  const [moreCharacters, setMoreCharacters] = useState<boolean>(false);

  useEffect(() => {
    if (scrollPosition.position > 0
      && scrollPosition?.pathname === location.pathname) {
      window.scrollTo({
        top: scrollPosition?.position,
        behavior: 'instant' as any,
      });
    }
  }, [scrollPosition, location.pathname]);

  const emptyScrollPosition = useCallback(() => {
    if (hasPageStateCache(location)
      && searchHashtag.length >= pageStateCache.length + 10) {
      deletePageStateCache(location);
    }
  }, [location, pageStateCache.length, searchHashtag.length]);

  const removeHashtag = (value: string) => {
    if (value.charAt(0) === '#') {
      return value.slice(1);
    }
    return value;
  };

  const searchData = async (criteria: string) => {
    const searchTag = removeHashtag(criteria);
    if (searchTag && searchTag.length >= 3) {
      await getSearchHashtag(searchTag ? 0 : page, searchTag).then((res) => {
        if (res.data && res.data.length > 0) {
          setSearchHashtag(res.data);
          if (searchTag) {
            setPage(1);
          } else {
            setPage(page + 1);
          }
          setLoadUser(false);
        } else {
          setSearchHashtag([]);
          setNoMoreData(true);
          setLoadUser(false);
          setPage(page + 1);
        }
        emptyScrollPosition();
      });
    } else {
      setMoreCharacters(true);
      setLoadUser(false);
      setSearchHashtag([]);
    }
  };

  const handleSearch = (value: string) => {
    setLoadUser(true);
    setMoreCharacters(false);
    setNoMoreData(false);
    setSearchHashtag([]);
    if (value && value.length >= 3) {
      setSearch(value);
      searchData(value);
    } else {
      setLoadUser(false);
      setMoreCharacters(true);
      setNoMoreData(false);
    }
    setPage(0);
  };

  const fetchMoreUsers = useCallback(() => {
    const searchTag = removeHashtag(search);
    getSearchHashtag(page, searchTag)
      .then((res) => {
        setSearchHashtag((prev: any) => [
          ...prev,
          ...res.data,
        ]);
        setPage(page + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
          setLoadUser(false);
        }
        emptyScrollPosition();
      })
      .catch(() => setNoMoreData(true))
      .finally(
        // eslint-disable-next-line max-len
        () => { setAdditionalSearchHashtag(false); setLoadUser(false); },
      );
  }, [emptyScrollPosition, page, search]);

  useEffect(() => {
    if (additionalSearchHashtag && !loadUser && search && search.length > 0) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || searchHashtag.length >= scrollPosition?.data?.length
        || searchHashtag.length === 0
        || scrollPosition.pathname !== location.pathname
        || page > 0
      ) {
        setLoadUser(true);
        fetchMoreUsers();
      }
    }
  }, [additionalSearchHashtag, fetchMoreUsers, loadUser, location.pathname, page, scrollPosition,
    search, searchHashtag]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        searchHashtag && searchHashtag.length === 0
          ? 'No hashtag found'
          : 'No more hashtag'
      }
    </p>
  );

  const persistScrollPosition = () => { setPageStateCache(location, searchHashtag); };

  return (
    <div>
      <SearchHeader
        tabKey="hashtags"
        setSearch={handleSearch}
        search={search}
        label="Search"
      />
      <InfiniteScroll
        threshold={3000}
        pageStart={0}
        initialLoad
        loadMore={() => { setAdditionalSearchHashtag(true); }}
        hasMore={!noMoreData}
        element="span"
      >
        <Row className="mt-4">
          {moreCharacters
            && (
              <h1 className="h3">
                Enter a search term into the search box above to find hashtag (
                must enter at least 3 characters
                ).
              </h1>
            )}

          {searchHashtag
            && searchHashtag.length > 0
            && searchHashtag.map(
              (hashtagDetail: SearchPeopleProps) => (
                <Col md={6} key={hashtagDetail._id}>
                  <Link
                    to={`/app/search/posts?hashtag=${hashtagDetail.name}`}
                    onClick={() => persistScrollPosition()}
                    className="text-decoration-none py-4 d-flex align-items-center"
                  >
                    <StyledHastagsCircle
                      className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light"
                    >
                      #
                    </StyledHastagsCircle>
                    <div className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                      <p className="fw-bold mb-0">
                        #
                        {hashtagDetail.name}
                      </p>
                      <small className="text-light mb-0">
                        {hashtagDetail.totalPost}
                        {' '}
                        {hashtagDetail.totalPost > 1 ? 'posts' : 'post'}
                        {' '}
                      </small>
                    </div>
                  </Link>
                </Col>
              ),
            )}
        </Row>
      </InfiniteScroll>
      {loadUser && <LoadingIndicator />}
      {search && search.length >= 3 && noMoreData && renderNoMoreDataMessage()}
    </div>
  );
}

export default SearchHashtags;
