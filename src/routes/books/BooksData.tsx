import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import SortData from '../../components/filter-sort/SortData';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../components/tabs/PosterCardList';
import TabLinks from '../../components/tabs/TabLinks';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import {
  allBooks, buyList, favoritesList, myBooks, read, readingList, slasherIndie,
} from './components/booksList';

interface BooksProps {
  id: number,
  name: string,
  image: string,
  year: string,
  liked: boolean,
}

function BooksData() {
  const tabs = [
    { value: 'all-books', label: 'All books' },
    { value: 'my-books', label: 'My books' },
    { value: 'slasher-indie', label: 'Slasher Indie' },
    { value: 'favorites-list', label: 'Favorites list' },
    { value: 'read', label: 'Read' },
    { value: 'reading-list', label: 'Reading list' },
    { value: 'buy-list', label: 'Buy list' },
  ];

  const [showKeys, setShowKeys] = useState(false);
  const path = useParams();
  const [books, setBooks] = useState<BooksProps[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BooksProps[]>([]);
  const [selectedBookTab, setSelectedBookTab] = useState<string>();
  const [search, setSearch] = useState<string>('');
  const searchData = () => {
    let searchResult;
    const newFilter = books;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredBooks(searchResult);
    } else {
      setFilteredBooks(books);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    searchData();
    if (path && path.id) {
      setSelectedBookTab(path.id);
    } else {
      setSelectedBookTab(tabs[0].value);
    }
  }, [search, path]);
  useEffect(() => {
    switch (path.id) {
      case tabs[0].value:
        setBooks(allBooks);
        setFilteredBooks(allBooks);
        break;
      case tabs[1].value:
        setBooks(myBooks);
        setFilteredBooks(myBooks);
        break;
      case tabs[2].value:
        setBooks(slasherIndie);
        setFilteredBooks(slasherIndie);
        break;
      case tabs[3].value:
        setBooks(favoritesList);
        setFilteredBooks(favoritesList);
        break;
      case tabs[4].value:
        setBooks(read);
        setFilteredBooks(read);
        break;
      case tabs[5].value:
        setBooks(readingList);
        setFilteredBooks(readingList);
        break;
      case tabs[6].value:
        setBooks(buyList);
        setFilteredBooks(buyList);
        break;
      default:
        setBooks([]);
        setFilteredBooks([]);
    }
  }, [path]);

  const changeTab = (value: string) => {
    navigate(`/books/${value}`);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="book">
      <Container fluid>
        <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={selectedBookTab} />
        <Row className="my-4 align-items-center">
          <Col md={4} className="my-3 my-md-0 order-md-second order-md-first">
            <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
          </Col>
          <Col md={4} className="text-center">
            <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
          </Col>
          <Col md={4} className="d-none d-lg-block">
            <SortData title="Sort: " className="rounded-5" />
          </Col>
          <Col md={4} className="order-first order-md-last">
            <RoundButton className="py-2 d-lg-none w-100">Add your book</RoundButton>
          </Col>
        </Row>
        {showKeys && (<FilterModal showKeys={showKeys} setShowKeys={setShowKeys} />)}
        <div className="bg-dark bg-mobile-transparent rounded-3 py-1 px-lg-2">
          <PosterCardList dataList={filteredBooks} />
        </div>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default BooksData;
