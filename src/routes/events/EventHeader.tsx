import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface EventHeaderProps {
  tabKey: string;
}
const tabs = [
  { value: 'by-location', label: 'By location' },
  { value: 'by-date', label: 'By date' },
  { value: 'favorites', label: 'Favorites' },
];
function EventHeader({ tabKey }: EventHeaderProps) {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/events/${tab}`);
  };
  return (
    <>
      <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4 justify-content-between" />
      <Row className="justify-content-end mt-4 d-lg-none">
        <Col md={4}>
          <Link to="/events/suggestion">
            <RoundButton className="w-100 fs-4">Suggest event</RoundButton>
          </Link>
        </Col>
      </Row>
    </>
  );
}

export default EventHeader;
