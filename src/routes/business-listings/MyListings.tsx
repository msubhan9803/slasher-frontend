import React, { useCallback, useEffect, useState } from 'react';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import MainListingWrapper from '../../components/ui/MyListings/MainListingWrapper';
import BooksHeader from '../books/BooksHeader';
import { Book } from '../books/components/BookProps';
import { myBooks } from '../books/components/booksList';
import BooksRightSideNav from '../books/components/BooksRightSideNav';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

function MyListings() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[] | any>(myBooks);

  const searchData = useCallback(() => {
    let searchResult;
    const newFilter = myBooks;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredBooks(searchResult);
    } else {
      setFilteredBooks(myBooks);
    }
  }, [search]);

  useEffect(() => {
    searchData();
  }, [search, searchData]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <MainListingWrapper />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default MyListings;
