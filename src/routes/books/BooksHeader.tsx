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
  { value: 'my-books', label: 'My books' },
  { value: 'slasher-indie', label: 'Slasher Indie' },
  { value: 'favorites', label: 'Favorites list' },
  { value: 'read', label: 'Read' },
  { value: 'reading-list', label: 'Reading list' },
  { value: 'buy-list', label: 'Buy list' },
];
const sortoptions = [
  { value: 'name', label: 'Sort: Alphabetical' },
  { value: 'releaseDate', label: 'Sort: Release Date' },
  { value: 'rating', label: 'Sort: User Rating' },
];
function BooksHeader({
  tabKey, showKeys, setShowKeys, setSearch, search, sort, selectedKey,
  applyFilter, sortVal,
}: any) {
  return (
    <>
      <TabLinks tabLink={bookTabs} toLink="/app/books" selectedTab={tabKey} />
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center">
          {/* <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} /> */}
          <FilterOptions
            activeSort={!!(sortVal && sortVal.length > 0)}
            activeKey={!!(selectedKey && selectedKey.length > 0)}
            setShowKeys={setShowKeys}
            showKeys={showKeys}
          />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <CustomSelect value={sortVal} onChange={sort} options={sortoptions} placeholder="Sort..." type="sort" />
          {/* <CustomSelect options={sortoptions} type="sort" /> */}
        </Col>
        <Col md={4} className="order-first order-md-last">
          <RoundButton className="d-lg-none w-100">Add your book</RoundButton>
        </Col>
      </Row>
      {showKeys
        && (
          <FilterModal
            showKeys={showKeys}
            setShowKeys={setShowKeys}
            selectedKey={selectedKey}
            applyFilter={applyFilter}
            sortoptions={sortoptions}
            sortVal={sortVal}
          />
        )}
    </>
  );
}

export default BooksHeader;
