/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { Book } from '../components/BookProps';
import { allBooks } from '../components/booksList';
import BooksRightSideNav from '../components/BooksRightSideNav';
import SuggestedBooks from '../suggested-books/SuggestedBooks';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { getBooks } from '../../../api/books';
import { setBooks } from '../../../redux/slices/booksSlice';
import { getCoverImageForBook } from '../../../utils/text-utils';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';

function AllBooks() {
  const [searchParams] = useSearchParams();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  // const [filteredBooks, setFilteredBooks] = useState<BooksProps[] | any>(allBooks);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const { books, lastRetrievalTime } = useAppSelector((state) => state.books);
  const dispatch = useAppDispatch();
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  const applyFilter = (keyValue: string, sortValue?: string) => {
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };
  // const searchData = useCallback(() => {
  //   let searchResult;
  //   const newFilter = allBooks;
  //   if (search) {
  //     searchResult = newFilter?.length > 0
  //       ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
  //       : [];
  //     setFilteredBooks(searchResult);
  //   } else {
  //     setFilteredBooks(allBooks);
  //   }
  // }, [search]);

  // useEffect(() => {
  //   searchData();
  // }, [search, searchData]);

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
  // TODO: Remove below comments
  // interface CardListProps {
  //   id: number;
  //   name: string;
  //   image: string;
  //   year: string;
  //   rating?: number;
  //   _id?: string | null;
  //   logo?: string;
  //   releaseDate?: string;
  //   worthWatching?: number;
  //   isDeactivate?: boolean;
  // }
  // export interface BooksProps {
  //   id: number,
  //   name: string,
  //   logo: string,
  //   year: string,
  //   liked: boolean,
  // }
  const dataList = books.map((book) => ({
    id: 1, // TODO~SAHIL: fix this ASAP
    _id: book._id,
    name: book.name,
    logo: getCoverImageForBook(book.covers[0]),
    year: book.publishDate,
    liked: false, // TODO~SAHIL: fix this ASAP

  }));
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="all"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={(query: string) => { setSearch(query); }}
          search={search}
          sort={(value: string) => {
            setSortVal(value);
          }}
          selectedKey={key}
          applyFilter={applyFilter}
          sortVal={sortVal}
        />
        <p className="h2 mb-0">Slasher indie</p>
        <SuggestedBooks />

        {/* // ! TODO~SAHIL: Imlement infinite <InfiniteScroll/> component
            // ! for `PostCardList` refer AllMovies.tsx file.  */}
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <p className="h2 mb-0">All books</p>
          <div>
            <PosterCardList dataList={dataList} type="book" />
            {loadingPosts && <LoadingIndicator />}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AllBooks;
