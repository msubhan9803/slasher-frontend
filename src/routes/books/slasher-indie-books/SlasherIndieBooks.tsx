import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { Book } from '../components/BookProps';
import BooksRightSideNav from '../components/BooksRightSideNav';
import { getBooks } from '../../../api/books';
import { BookType } from '../../../types';

function SlasherIndieBooks() {
  const [searchParams] = useSearchParams();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[] | any>([]);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');

  const searchData = useCallback(() => {
    let searchResult;

    getBooks(
      search,
      sortVal,
      key.toLowerCase(),
      '',
      BookType.UserDefined.toString(),
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

      const newFilter = dataList;
      if (search) {
        searchResult = newFilter && newFilter.length > 0
          ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
          : [];
        setFilteredBooks(searchResult);
      } else {
        setFilteredBooks(dataList);
      }
    });
  }, [search, key, sortVal]);

  useEffect(() => {
    searchData();
  }, [search, searchData]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="slasher-indie"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={setSearch}
          search={search}
          selectedKey={key}
          sortVal={sortVal}
        />
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <p className="h2 mb-0">Slasher indie</p>
          <div>
            <PosterCardList dataList={filteredBooks} type="book" />
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default SlasherIndieBooks;
