import React, { useEffect, useState } from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import BooksHeader from '../BooksHeader';
import { BooksProps } from '../components/BookProps';
import { favoriteBooks } from '../components/booksList';
import BooksRigthSideNav from '../components/BooksRigthSideNav';

function FavoriteBooks() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<BooksProps[]>(favoriteBooks);
  const searchData = () => {
    let searchResult;
    const newFilter = favoriteBooks;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredBooks(searchResult);
    } else {
      setFilteredBooks(favoriteBooks);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <BooksHeader
          tabKey="favorites"
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
      <RightSidebarWrapper className="d-none d-lg-block">
        <BooksRigthSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default FavoriteBooks;
