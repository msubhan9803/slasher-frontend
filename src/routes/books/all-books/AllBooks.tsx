import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { BooksProps } from '../components/BookProps';
import { allBooks } from '../components/booksList';
import BooksRightSideNav from '../components/BooksRightSideNav';
import SuggestedBooks from '../suggested-books/SuggestedBooks';

function AllBooks() {
  const [searchParams] = useSearchParams();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<BooksProps[] | any>(allBooks);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');

  const applyFilter = (keyValue: string, sortValue?: string) => {
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };
  const searchData = useCallback(() => {
    let searchResult;
    const newFilter = allBooks;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredBooks(searchResult);
    } else {
      setFilteredBooks(allBooks);
    }
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);
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
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <p className="h2 mb-0">All books</p>
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

export default AllBooks;
