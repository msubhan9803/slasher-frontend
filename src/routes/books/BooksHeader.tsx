import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import CustomSelect from '../../components/filter-sort/CustomSelect';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

const bookTabs = [
  { value: 'all', label: 'All books' },
  { value: 'slasher-indie', label: 'Slasher Indie' },
  { value: 'favorites', label: 'Favorites list' },
  { value: 'read', label: 'Read' },
  { value: 'reading-list', label: 'Reading list' },
  { value: 'buy-list', label: 'Buy list' },
  { value: 'my-books', label: 'My books' },
];
const sortoptions = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'userRating', label: 'User Rating' },
];
function BooksHeader({
  tabKey, showKeys, setShowKeys, setSearch, search,
}: any) {
  return (
    <>
      <TabLinks tabLink={bookTabs} toLink="/books" selectedTab={tabKey} />
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center">
          <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <CustomSelect options={sortoptions} type="sort" />
        </Col>
        <Col md={4} className="order-first order-md-last">
          <RoundButton className="d-lg-none w-100">Add your book</RoundButton>
        </Col>
      </Row>
      {showKeys && (<FilterModal showKeys={showKeys} setShowKeys={setShowKeys} />)}
    </>
  );
}

export default BooksHeader;
