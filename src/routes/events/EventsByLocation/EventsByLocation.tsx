import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { LatLngLiteral } from 'leaflet';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../../../components/ui/MapComponent';
import PubWiseAd from '../../../components/ui/PubWiseAd';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import checkAdsEventByLocation from './checkAdsEventByLocation';
import { EVENTS_BY_LOCATION_DIV_ID } from '../../../utils/pubwise-ad-units';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import EventRightSidebar from '../EventRightSidebar';

const eventsList = [
  {
    id: 1,
    image: `${EventPoster}`,
    date: '01/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2,
    image: `${EventPoster}`,
    date: '02/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 3,
    image: `${EventPoster}`,
    date: '03/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 4,
    image: `${EventPoster}`,
    date: '04/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 5,
    image: `${EventPoster}`,
    date: '05/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 6,
    image: `${EventPoster}`,
    date: '06/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 7,
    image: `${EventPoster}`,
    date: '07/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 8,
    image: `${EventPoster}`,
    date: '08/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 9,
    image: `${EventPoster}`,
    date: '09/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 10,
    image: `${EventPoster}`,
    date: '10/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 11,
    image: `${EventPoster}`,
    date: '11/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 12,
    image: `${EventPoster}`,
    date: '12/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 13,
    image: `${EventPoster}`,
    date: '13/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 14,
    image: `${EventPoster}`,
    date: '14/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 15,
    image: `${EventPoster}`,
    date: '15/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 16,
    image: `${EventPoster}`,
    date: '16/05/2022',
    location: '1 Main St, New York, NY USA',
    eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function EventsByLocation() {
  const [center, setCenter] = useState<LatLngLiteral>({ lat: 42.519539, lng: -70.896713 });
  const bp = useBootstrapBreakpointName();

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
            {eventsList.map((eventDetail, i, arr) => {
              const show = checkAdsEventByLocation(bp, i, arr);
              return (
                <React.Fragment key={eventDetail.id}>
                  <Col md={6}>
                    <EventsPosterCard
                      listDetail={eventDetail}
                    />
                  </Col>
                  {show && <PubWiseAd className="text-center my-3" id={EVENTS_BY_LOCATION_DIV_ID} autoSequencer />}
                </React.Fragment>
              );
            })}
          </Row>

        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default EventsByLocation;
