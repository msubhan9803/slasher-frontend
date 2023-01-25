import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { LatLngLiteral } from 'leaflet';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../../../components/ui/MapComponent';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import EventRightSidebar from '../EventRightSidebar';

const eventsList = [
  {
    id: 1,
    image: `${EventPoster}`,
    date: '07/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2,
    image: `${EventPoster}`,
    date: '07/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function EventsByLocation() {
  const [center, setCenter] = useState<LatLngLiteral>({ lat: 42.519539, lng: -70.896713 });

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <EventHeader tabKey="by-location" />
        <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
          <MapComponent
            defaultCenter={center}
            onCenterChange={(newCenter) => setCenter(newCenter)}
            defaultZoomLevel={10}
          />
          <p
            className="fs-3 text-light mt-4 mb-3 text-center"
          >
            Click on a pin for info
          </p>
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
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default EventsByLocation;
