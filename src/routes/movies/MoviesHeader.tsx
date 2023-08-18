import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import CustomSelect from '../../components/filter-sort/CustomSelect';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../env';

interface MovisHeaderProps {
  tabKey: string;
  showKeys: boolean;
  setShowKeys: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch: React.Dispatch<string>;
  search: string;
  sort?(value: string): void | undefined;
  selectedKey?: string;
  applyFilter?(keyValue: string, sortValue?: string): void;
  showMovieTab?: boolean;
  sortVal?: string;
}

const tabs = [
  { value: 'all', label: 'All movies' },
  { value: 'slasher-indie', label: 'Slasher Indie', devOnly: true },
  { value: 'favorites', label: 'Favorites list' },
  { value: 'watch-list', label: 'Watch list' },
  { value: 'watched-list', label: 'Watched list' },
  { value: 'buy-list', label: 'Buy list' },
  { value: 'my-movies', label: 'My movies', devOnly: true },
];
const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => !t.devOnly);
const sortoptions = [
  { value: 'name', label: 'Sort: Alphabetical' },
  { value: 'releaseDate', label: 'Sort: Release Date' },
  { value: 'rating', label: 'Sort: User Rating' },
];
function MoviesHeader({
  tabKey, showKeys, setShowKeys, setSearch, search, sort, selectedKey,
  applyFilter, showMovieTab, sortVal,
}: MovisHeaderProps) {
  return (
    <>
      {showMovieTab
        && <TabLinks tabLink={allTabs} toLink="/app/movies" selectedTab={tabKey} />}
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center">
          <FilterOptions
            activeSort={!!(sortVal && sortVal.length > 0)}
            activeKey={!!(selectedKey && selectedKey.length > 0)}
            setShowKeys={setShowKeys}
            showKeys={showKeys}
          />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <CustomSelect value={sortVal} onChange={sort} options={sortoptions} placeholder="Sort..." type="sort" />
        </Col>
        {enableDevFeatures && (
          <Col md={4} className="order-first order-md-last">
            <RoundButton className="d-lg-none w-100">Add your movie</RoundButton>
          </Col>
        )}
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

MoviesHeader.defaultProps = {
  sort: undefined,
  selectedKey: '',
  applyFilter: null,
  showMovieTab: true,
  sortVal: 'name',
};

export default MoviesHeader;
