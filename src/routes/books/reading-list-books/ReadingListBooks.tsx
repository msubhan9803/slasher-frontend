/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroller';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { Book } from '../components/BookProps';
import BooksRightSideNav from '../components/BooksRightSideNav';
import { getUserBookList, getUserMoviesList } from '../../../api/users';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';
import { UIRouteURL } from '../../movies/RouteURL';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import RoundButton from '../../../components/ui/RoundButton';

function ReadingListBooks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pageStateCache = getPageStateCache(location) ?? [];

  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(
    hasPageStateCache(location) ? pageStateCache : [],
  );
  const [requestAdditionalBooks, setRequestAdditionalBooks] = useState<boolean>(false);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
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

  useEffect(() => {
    if (requestAdditionalBooks && !loadingBooks && userId) {
      if (!hasPageStateCache(location)
        || filteredBooks.length >= pageStateCache?.length
        || filteredBooks.length === 0
      ) {
        setNoMoreData(false);
        setLoadingBooks(true);
        getUserBookList(
          'reading-booklist',
          search,
          userId,
          sortVal,
          key.toLowerCase(),
          lastBookId.length > 0 ? lastBookId : undefined,
        )
          .then((res) => {
            const dataList = res.data.map((book: Book) => ({
              _id: book._id,
              name: book.name,
              logo: book.coverImage?.image_path,
              year: book.publishDate,
              liked: false,
              rating: book.rating,
              worthReading: book.worthReading,

            }));
            if (lastBookId) {
              setFilteredBooks((prev: any[]) => [
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
      }
    }
  }, [requestAdditionalBooks, loadingBooks, search, sortVal, lastBookId, filteredBooks,
    dispatch, userId, isKeyBooksReady, key, location, pageStateCache?.length]);

  const persistScrollPosition = () => { setPageStateCache(location, filteredBooks); };

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
    if (userId) {
      getUserMoviesList('reading-booklist', search, userId, sortVal, '')
        .then((result: any) => {
          setFilteredBooks(result.data);
        });
    }
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="reading-list"
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
          <p className="h2 mb-0">Reading List</p>
          <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
          <div className="m-md-2">
            <InfiniteScroll
              threshold={3000}
              pageStart={0}
              initialLoad
              loadMore={() => { setRequestAdditionalBooks(true); }}
              hasMore={!noMoreData}
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
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default ReadingListBooks;
