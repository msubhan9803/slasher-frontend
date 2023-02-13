import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ContentPageWrapper,
  ContentSidbarWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import BooksRigthSideNav from './components/BooksRigthSideNav';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicBooksIndexList from './BasicBooksIndexList';
import { getBooks } from '../../api/books';
import { setBooksInitialData } from '../../redux/slices/booksSlice';
import { useAppSelector } from '../../redux/hooks';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { CustomHeader, TableRow } from '../../components/ui/customTable';

function BasicBooksIndex() {
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const books = useAppSelector<any>((state) => state.books);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoadingPosts(true);
    getBooks().then((res: any) => {
      if (res) {
        if (res) {
          dispatch(setBooksInitialData(res.data));
        }
      }
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
      setLoadingPosts(false);
    }).finally(
      () => {
        setLoadingPosts(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            <ErrorMessageList errorMessages={errorMessage} className="m-0" />
          </div>
          )}
          <div className="m-md-2">
            <CustomHeader>Books</CustomHeader>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && books?.books?.length > 0 && (
            <BasicBooksIndexList books={books && books?.books} />
            )}
            {!loadingPosts && books?.books?.length === 0 && <TableRow>No Data Found</TableRow>}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRigthSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicBooksIndex;
