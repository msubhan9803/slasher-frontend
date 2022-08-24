import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import MapImage from '../../../images/map-image.jpg';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';

const MapLocation = styled.div`
  aspect-ratio : 1.84;
`;
const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function EventsByLocation() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="by-location" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <MapLocation>
          <Image src={MapImage} alt="Google map" className="h-100 w-100 rounded" />
          <p className="text-center fs-3 text-light my-md-2 my-3">Tap on a pin for info</p>
        </MapLocation>

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

export default EventsByLocation;
