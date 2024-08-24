import React, { useCallback, useEffect, useState } from 'react';
import {
  ContentPageWrapper,
  ContentSidbarWrapper,
} from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BooksHeader from '../BooksHeader';
import BooksRightSideNav from '../components/BooksRightSideNav';
import MainListingWrapper from '../../../components/ui/MyListings/MainListingWrapper';

function MyBooks() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="my-books"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={setSearch}
          search={search}
        />

        <MainListingWrapper />

        {/* <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <p className="h2 mb-0">My books</p>
          <div>
            <PosterCardList dataList={filteredBooks} type="book" />
          </div>
        </div> */}
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default MyBooks;
