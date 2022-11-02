import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import SortData from '../../components/filter-sort/SortData';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface MovisHeaderProps {
  tabKey: string;
  showKeys: boolean;
  setShowKeys: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch: React.Dispatch<string>;
  search: string;
  sort?(e : string) : void;
  selectedKey?(e : string) : void;
  applyFilter?() : void;
}

const tabs = [
  { value: 'all', label: 'All movies' },
  { value: 'slasher-indie', label: 'Slasher Indie' },
  { value: 'favorites', label: 'Favorites list' },
  { value: 'watch-list', label: 'Watch list' },
  { value: 'watched-list', label: 'Watched list' },
  { value: 'buy-list', label: 'Buy list' },
  { value: 'my-movies', label: 'My movies' },
];
const sortoptions = [
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'userRating', label: 'User Rating' },
];
function MoviesHeader({
  tabKey, showKeys, setShowKeys, setSearch, search, sort, selectedKey, applyFilter,
}: MovisHeaderProps) {
  const onSelectSort = (e : React.ChangeEvent<HTMLSelectElement>) => {
    if (sort) {
      sort(e.target.value);
    }
  };
  return (
    <>
      <TabLinks tabLink={tabs} toLink="/movies" selectedTab={tabKey} />
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center">
          <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <SortData onSelectSort={onSelectSort} sortoptions={sortoptions} title="Sort: " className="rounded-5" type="sort" />
        </Col>
        <Col md={4} className="order-first order-md-last">
          <RoundButton className="py-2 d-lg-none w-100">Add your movie</RoundButton>
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
            onSelectSort={onSelectSort}
          />
        )}
    </>
  );
}

MoviesHeader.defaultProps = {
  sort: null,
  selectedKey: null,
  applyFilter: null,
};

export default MoviesHeader;
