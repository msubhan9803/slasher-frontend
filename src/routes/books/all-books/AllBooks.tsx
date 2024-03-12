/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { Book } from '../components/BookProps';
import BooksRightSideNav from '../components/BooksRightSideNav';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getBooks } from '../../../api/books';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';
import SuggestedBooks from '../suggested-books/SuggestedBooks';
import { UIRouteURL } from '../../movies/RouteURL';
import RoundButton from '../../../components/ui/RoundButton';
import { enableDevFeatures } from '../../../env';
import SticyBannerAdSpaceCompensation, { useShowSticyBannerAdMobileOnly } from '../../../components/SticyBannerAdSpaceCompensation';

function AllBooks() {
  const [searchParams] = useSearchParams();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageStateCache = getPageStateCache(location) ?? [];

  const [filteredBooks, setFilteredBooks] = useState<Book[]>(
    hasPageStateCache(location) ? pageStateCache : [],
  );
  const [requestAdditionalBooks, setRequestAdditionalBooks] = useState<boolean>(false);
  const userId = useAppSelector((state) => state.user.user.id);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [isKeyBooksReady, setKeyBooksReady] = useState<boolean>(false);
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const [lastBookId, setLastBookId] = useState(
    ((hasPageStateCache(location)) && (pageStateCache.length > 0))
      /* eslint-disable no-unsafe-optional-chaining */
      ? (pageStateCache[pageStateCache.length - 1]?._id)
      : '',
  );
  const prevSearchRef = useRef(search);
  const prevKeyRef = useRef(key);
  const prevSortValRef = useRef(sortVal);
  const lastLocationKeyRef = useRef(location.key);
  const showSticyBannerAdMobileOnly = useShowSticyBannerAdMobileOnly();
  const { infiniteScrollRef } = useAppSelector((state) => state.mobileAd);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setKey(searchParams.get('startsWith')?.toLowerCase() || '');
    setSortVal(searchParams.get('sort') || 'name');
  }, [searchParams]);

  useEffect(() => {
    UIRouteURL(search, key, sortVal, navigate, callNavigate);
    setCallNavigate(false);
  }, [search, key, sortVal, navigate, callNavigate]);

  useEffect(() => {
    if (
      callNavigate
      || search !== prevSearchRef.current
      || key !== prevKeyRef.current
      || sortVal !== prevSortValRef.current
    ) {
      setFilteredBooks([]);
      setLastBookId('');
      setRequestAdditionalBooks(true);
    }
    prevSearchRef.current = search;
    prevKeyRef.current = key;
    prevSortValRef.current = sortVal;
  }, [callNavigate, search, key, sortVal]);

  const fetchBooks = useCallback((forceReload = false) => {
    if (forceReload) { setFilteredBooks([]); }
    setNoMoreData(false);
    setLoadingBooks(true);
    getBooks(
      search,
      sortVal,
      key.toLowerCase(),
      lastBookId.length > 0 ? lastBookId : undefined,
    ).then((res) => {
      const dataList = res.data.map((book: Book) => ({
        _id: book._id,
        name: book.name,
        logo: book?.coverImage?.image_path,
        year: book.publishDate,
        liked: false,
        rating: book.rating,
        worthReading: book.worthReading,
      }));
      if (lastBookId) {
        setFilteredBooks((prev: Book[]) => [
          ...prev,
          ...dataList,
        ]);
      } else {
        setFilteredBooks(dataList);
      }
      if (res.data.length === 0) {
        setNoMoreData(true);
        setLastBookId('');
      } else {
        setLastBookId(res.data[res.data.length - 1]._id);
      }
      if (res.data.length === 0) { setNoMoreData(true); }
      deletePageStateCache(location);
    }).catch(
      (error) => {
        setNoMoreData(true);
        setErrorMessage(error.response.data.message);
      },
    ).finally(
      () => { setRequestAdditionalBooks(false); setLoadingBooks(false); },
    );
  }, [key, lastBookId, location, search, sortVal]);

  useEffect(() => {
    if (requestAdditionalBooks && !loadingBooks) {
      if (!hasPageStateCache(location)
        || filteredBooks.length >= pageStateCache?.length
        || filteredBooks.length === 0
      ) {
        fetchBooks();
      }
    }
  }, [requestAdditionalBooks, loadingBooks, search, sortVal, lastBookId, filteredBooks,
    dispatch, isKeyBooksReady, key, location, pageStateCache?.length, fetchBooks]);

  useEffect(() => {
    if (requestAdditionalBooks && noMoreData) {
      const isSameKey = lastLocationKeyRef.current === location.key;
      if (isSameKey) { return; }
      fetchBooks(true);
      lastLocationKeyRef.current = location.key;
    }
  }, [fetchBooks, location.key, noMoreData, requestAdditionalBooks]);

  useEffect(() => {
    if (
      callNavigate
      || search !== prevSearchRef.current
      || key !== prevKeyRef.current
      || sortVal !== prevSortValRef.current
    ) {
      setFilteredBooks([]);
      setLastBookId('');
      setRequestAdditionalBooks(true);
    }
    prevSearchRef.current = search;
    prevKeyRef.current = key;
    prevSortValRef.current = sortVal;
  }, [callNavigate, search, key, sortVal]);

  useEffect(() => {
    if (requestAdditionalBooks && noMoreData) {
      const isSameKey = lastLocationKeyRef.current === location.key;
      if (isSameKey) { return; }
      fetchBooks(true);
      // Update lastLocation
      lastLocationKeyRef.current = location.key;
    }
  }, [fetchBooks, location.key, noMoreData, requestAdditionalBooks]);

  const applyFilter = (keyValue: string, sortValue?: string) => {
    setCallNavigate(true);
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        filteredBooks.length === 0
          ? 'No Books available'
          : 'No more Books'
      }
    </p>
  );

  const clearKeyHandler = () => {
    setKey('');
    setCallNavigate(true);
    setKeyBooksReady(false);
    setLastBookId('');
    setFilteredBooks([]);
    getBooks(search, sortVal, '')
      .then((result: any) => {
        setFilteredBooks(result.data);
      });
  };

  const persistScrollPosition = () => { setPageStateCache(location, filteredBooks); };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="all"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={(query: string) => { setSearch(query); setCallNavigate(true); }}
          search={search}
          sort={(value: string) => {
            setSortVal(value);
            setCallNavigate(true);
          }}
          selectedKey={key}
          applyFilter={applyFilter}
          sortVal={sortVal}
        />
        {enableDevFeatures
          && (
            <>
              <p className="h2 mb-0">Slasher indie</p>
              <SuggestedBooks />
            </>
          )}
        {key !== '' && (isKeyBooksReady || pageStateCache.length <= filteredBooks.length)
          && (
            <div className="w-100 d-flex justify-content-center mb-3">
              <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
                Starts with
                {' '}
                {key.toUpperCase()}
                {' '}
                <FontAwesomeIcon icon={solid('x')} size="sm" />
              </RoundButton>
            </div>
          )}
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <p className="h2 mb-0">All books</p>
          <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
          <div className="m-md-2">
            <InfiniteScroll
              threshold={3000}
              pageStart={0}
              initialLoad
              loadMore={() => { setRequestAdditionalBooks(true); }}
              hasMore={!noMoreData}
              getScrollParent={() => infiniteScrollRef}
              useWindow={!showSticyBannerAdMobileOnly}
            >
              <PosterCardList
                // eslint-disable-next-line max-len
                dataList={filteredBooks.map((b) => ({ ...b, worthWatching: b.worthReading })) as any}
                type="book"
                onSelect={persistScrollPosition}
              />
            </InfiniteScroll>
            {loadingBooks && <LoadingIndicator />}
            {noMoreData && renderNoMoreDataMessage()}
          </div>
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AllBooks;
