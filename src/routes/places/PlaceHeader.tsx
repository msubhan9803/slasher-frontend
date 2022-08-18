import React from 'react';
import { Col, Row } from 'react-bootstrap';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

const tabs = [
  { value: 'location', label: 'By location' },
  { value: 'category', label: 'By category' },
  { value: 'newest', label: 'Newest' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-places', label: 'My places' },
];
function PlaceHeader({
  tabKey, changeTab,
}: any) {
  return (
    <>
      <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4 justify-content-between" />
      <Row className="justify-content-end mt-4 d-lg-none">
        <Col md={4}>
          <RoundButton className="py-2 w-100">Add your place</RoundButton>
        </Col>
      </Row>
    </>
  );
}

export default PlaceHeader;
