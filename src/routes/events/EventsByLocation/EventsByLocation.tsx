import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import {
  TileLayer, MapContainer, Marker, Popup,
} from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import Leaflet from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';

const Map = styled(MapContainer)`
  height: 400px !important;
  width: 100% !important;
  z-index:0;
  .leaflet-div-icon {
    background: transparent !important;
    border: none !important;
  }
  .leaflet-popup-content{
    margin: 13px 20px 13px 16px;
  }
  .leaflet-popup {
    bottom : 0 !important;
  }
`;

const iconHTML = ReactDOMServer.renderToString(<FontAwesomeIcon icon={solid('location-dot')} size="3x" className="text-primary" />);
const customMarkerIcon = new Leaflet.DivIcon({
  html: iconHTML,
  iconAnchor: [12, 5], // [left/right, top/bottom]
});

const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function EventsByLocation() {
  const mapRef = useRef() as any;
  const ZOOM_LEVEL = 9;
  const [center, setCenter] = useState<any>([42.519539, -70.896713]);

  const onSuccess = useCallback((position: any) => {
    const userLocation = [position.coords.latitude, position.coords.longitude];
    setCenter([...userLocation]);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onSuccess);
  }, []);

  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="by-location" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <Map
          key={`${center[0]}-${center[1]}`}
          center={center}
          zoom={ZOOM_LEVEL}
          ref={mapRef}
        >
          <TileLayer
            url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=SLcHU7I1RZjHoCZGIbr6"
            attribution={'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
          />
          <Marker
            position={center}
            icon={customMarkerIcon}
          >
            <Popup>
              <div>
                <p className="fs-5 fw-normal mb-3 ">24/06/2022 -26/06/2022</p>
                <div className="d-flex align-items-baseline">
                  <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="lg" />
                  <span className="fs-3 fw-normal mb-2">1 Main St, New York, NY USA</span>
                </div>
                <h1 className="h3 fw-bold">Escape from a House of Horror - A Diane Sawyer Special Event</h1>
                <Button className="bg-transparent text-primary border-0 shadow-none p-0">View event</Button>
              </div>
            </Popup>
          </Marker>
        </Map>

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
