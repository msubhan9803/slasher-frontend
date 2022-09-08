import React from 'react';
import { Col, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';

const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 3, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 4, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function Favorites() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="favorites" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-lg-4 rounded">
        <Row className="justify-content-md-center">
          {eventsList.map((eventDetail) => (
            <Col md={6} key={eventDetail.id}>
              <EventsPosterCard
                listDetail={eventDetail}
              />
            </Col>
          ))}
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default Favorites;
