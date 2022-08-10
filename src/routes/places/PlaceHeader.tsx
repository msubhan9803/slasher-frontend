import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import SortData from '../../components/filter-sort/SortData';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface PlaceHeaderProps {
  tabKey: string;
  changeTab: (value: string) => void;
  showKeys: boolean;
  setShowKeys: (value: boolean) => void;

}
const tabs = [
  { value: 'location', label: 'By location' },
  { value: 'category', label: 'By category' },
  { value: 'newest', label: 'Newest' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-places', label: 'My places' },
];
const sortoptions = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'userRating', label: 'User Rating' },
];
function PlaceHeader({
  tabKey, changeTab, showKeys, setShowKeys,
}: PlaceHeaderProps) {
  return (
    <>
      <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} />
      <Row className="mt-4 mb-lg-3 justify-content-between align-items-center">
        <Col md={5} className="d-none d-lg-block">
          <SortData type="select" className="rounded-5" />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <SortData title="Sort: " sortoptions={sortoptions} type="sort" className="rounded-5" />
        </Col>
        <Col md={4} className="order-first order-md-last">
          <RoundButton className="py-2 d-lg-none w-100">Add your place</RoundButton>
        </Col>
        <Col md={4} className="d-lg-none text-center">
          <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
        </Col>
      </Row>
    </>
  );
}

export default PlaceHeader;
