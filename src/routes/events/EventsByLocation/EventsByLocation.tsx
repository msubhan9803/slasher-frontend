import React, { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../../../components/ui/MapComponent';

const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function EventsByLocation() {
  const ZOOM_LEVEL = 9;
  const [center, setCenter] = useState<any>([42.519539, -70.896713]);

  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="by-location" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <MapComponent
          center={center}
          setCenter={setCenter}
          ZOOM_LEVEL={ZOOM_LEVEL}
        />
        <Button
          className="d-flex mx-auto bg-transparent shadow-none border-0 fs-3 text-light mt-3"
        >
          Click on a pin for info
        </Button>
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
