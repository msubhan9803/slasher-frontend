import React from 'react';
import { Col, Row } from 'react-bootstrap';
import CustomSelect from '../../components/filter-sort/CustomSelect';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface PlaceHeaderProps {
  tabKey: string;
}
const tabs = [
  { value: 'by-location', label: 'By location' },
  { value: 'by-category', label: 'By category' },
  { value: 'newest', label: 'Newest' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-places', label: 'My places' },
];
const sortoptions = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'userRating', label: 'User Rating' },
];
function PlaceHeader({ tabKey }: PlaceHeaderProps) {
  return (
    <>
      <TabLinks tabLink={tabs} toLink="/places" selectedTab={tabKey} />
      <Row className="mt-4 mb-lg-3 justify-content-between align-items-center">
        <Col md={4} lg={5} className="mt-4 mt-md-0">
          <CustomSelect />
        </Col>
        <Col md={4} lg={5} xl={4} className="mt-4 mt-md-0">
          <CustomSelect options={sortoptions} type="sort" />
        </Col>
        <Col md={4} className="order-first order-md-last">
          <RoundButton className="d-lg-none w-100">Add your place</RoundButton>
        </Col>
      </Row>
    </>
  );
}

export default PlaceHeader;
