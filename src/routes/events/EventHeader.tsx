import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../env';

interface EventHeaderProps {
  tabKey: string;
}
const tabs = [
  { value: 'by-location', label: 'By location', devOnly: true },
  { value: 'by-date', label: 'By date' },
  { value: 'favorites', label: 'Favorites', devOnly: true },
];
const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => !t.devOnly);
function EventHeader({ tabKey }: EventHeaderProps) {
  return (
    <>
      <TabLinks tabLink={allTabs} toLink="/app/events" selectedTab={tabKey} />
      <Row className="justify-content-center mt-4 d-lg-none">
        <Col md={6}>
          <Link to="/app/events/suggestion">
            <RoundButton className="w-100 fs-4">Suggest event</RoundButton>
          </Link>
        </Col>
      </Row>
    </>
  );
}

export default EventHeader;
