import React, { useEffect, useState } from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { BooksProps } from '../components/BookProps';
import { slasherIndieBooks } from '../components/booksList';
import BooksRigthSideNav from '../components/BooksRigthSideNav';

function SlasherIndieBooks() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<BooksProps[]>(slasherIndieBooks);
  const searchData = () => {
    let searchResult;
    const newFilter = slasherIndieBooks;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredBooks(searchResult);
    } else {
      setFilteredBooks(slasherIndieBooks);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <BooksHeader
          tabKey="slasher-indie"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={setSearch}
          search={search}
        />
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <div className="m-md-2">
            <PosterCardList dataList={filteredBooks} />
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <BooksRigthSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default SlasherIndieBooks;
