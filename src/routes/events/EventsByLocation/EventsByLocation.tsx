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
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';

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
  const [center, setCenter] = useState<any>([0, 0]);

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
        <MapContainer
          key={`${center[0]}-${center[1]}`}
          style={{ height: '400px !important', width: '100% !important' }}
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
              <h1>You are here!</h1>
            </Popup>
          </Marker>
        </MapContainer>

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
