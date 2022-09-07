import React, { useEffect, useState } from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import SearchHeader from '../SearchHeader';
import { books } from '../SearchResult';

export interface SearchBooksProps {
  id: number,
  name: string,
  image: string,
  year: string,
  liked: boolean,
}
function SearchBooks() {
  const [search, setSearch] = useState<string>('');
  const [searchBooks, setSearchBooks] = useState<SearchBooksProps[]>(books);
  const searchData = () => {
    let searchResult;
    const newFilter = books;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchBooksProps) => src.name.toLowerCase().includes(search))
        : [];
      setSearchBooks(searchResult);
    } else {
      setSearchBooks(books);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchHeader
        tabKey="books"
        setSearch={setSearch}
        search={search}
      />
      <div className="rounded-3 px-lg-4 p-3">
        <div className="m-md-2">
          <PosterCardList dataList={searchBooks} />
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default SearchBooks;
