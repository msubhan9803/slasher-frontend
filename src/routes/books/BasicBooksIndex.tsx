import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import {
  ContentPageWrapper,
  ContentSidbarWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import BooksRightSideNav from './components/BooksRightSideNav';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicBooksIndexList from './BasicBooksIndexList';
import { getBooks } from '../../api/books';
import { setBooks } from '../../redux/slices/booksSlice';
import { useAppSelector } from '../../redux/hooks';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';

function BasicBooksIndex() {
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const { books, lastRetrievalTime } = useAppSelector<any>((state) => state.books);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!lastRetrievalTime
      || DateTime.now().diff(DateTime.fromISO(lastRetrievalTime)).as('minutes') > 5
    ) {
      setLoadingPosts(true);
      getBooks().then((res: any) => {
        dispatch(setBooks(res.data));
      }).catch((error) => {
        setErrorMessage(error.response.data.message);
      }).finally(() => {
        setLoadingPosts(false);
      });
    } else {
      setLoadingPosts(false);
    }
  }, [dispatch, lastRetrievalTime]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <div className="m-2">
            <h1 className="h2">Books</h1>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && books?.length > 0 && (
              <BasicBooksIndexList books={books} />
            )}
            {!loadingPosts && books?.length === 0
              && (
              <div className="py-3 fw-bold" style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
                No Data Found
              </div>
              )}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicBooksIndex;
