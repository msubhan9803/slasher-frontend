/* eslint-disable max-lines */
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import Leaflet, { LatLngLiteral } from 'leaflet';
import { DateTime } from 'luxon';
import _ from 'lodash';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../../../components/ui/MapComponent';
import PubWiseAd from '../../../components/ui/PubWiseAd';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import checkAdsEventByLocation from './checkAdsEventByLocation';
import { EVENTS_BY_LOCATION_DIV_ID } from '../../../utils/pubwise-ad-units';
import { DEFAULT_EVENTS_USER_LOCATION } from '../../../constants';
import { LocationPointType } from '../../../types';
import { getEventsByRectangularArea } from '../../../api/eventByRectangularArea';

type GetLocationOptions = { city: string, state: string, country: string };
function getLocationName({ city, state, country }: GetLocationOptions) {
  let address = '';
  if (city) {
    address += `${city}, `;
  }
  if (state) {
    address += `${state}, `;
  }
  if (country) {
    address += `${country}`;
  }
  return address;
}

type EventType = {
  id: string, image: string, date: string, location: string,
  eventName: string, locationPoint: LocationPointType,
  name: string, dateRange: string,
};

function EventsByLocation() {
  const [userLocation, setUserLocation] = useState<LatLngLiteral>(DEFAULT_EVENTS_USER_LOCATION);
  const [events, setEvents] = useState<EventType[]>([]);
  const bp = useBootstrapBreakpointName();
  const mapRef = useRef<Leaflet.Map>(null);
  const onCenterChangeDebounced = useMemo(() => _.debounce(
    (newCenter: LatLngLiteral) => setUserLocation(
      { lat: Number(newCenter.lat), lng: Number(newCenter.lng) },
    ),
    500,
  ), [setUserLocation]);
  const markerLocations = useMemo(() => events.map((evt) => {
    const [lat, lng] = evt.locationPoint.coordinates;
    return {
      id: evt.id,
      latLng: { lat, lng },
      dateRange: evt.dateRange,
      address: evt.location,
      name: evt.name,
      linkText: 'View event',
      linkAddress: `/app/events/${evt.id}`,
    };
  }), [events]);

  const fetchAndSetEventsDebounced = useMemo(() => _.debounce(() => {
    if (!mapRef.current) { return; }

    const visibleMap = mapRef.current.getBounds();
    const {
      lat: lattitudeTopRight,
      lng: longitudeTopRight,
    } = visibleMap.getNorthEast();
    const {
      lat: lattitudeBottomLeft,
      lng: longitudeBottomLeft,
    } = visibleMap.getSouthWest();
    getEventsByRectangularArea(
      lattitudeTopRight,
      longitudeTopRight,
      lattitudeBottomLeft,
      longitudeBottomLeft,
    )
      .then((res) => setEvents(res.data.map((evt: any) => ({
        id: evt._id,
        image: evt?.images[0] ?? `${EventPoster}`,
        date: evt.startDate,
        location: getLocationName({ city: evt?.city, state: evt?.state, country: evt?.country }),
        eventName: evt.name,
        locationPoint: evt.location,
        name: evt.name,
        dateRange: `${DateTime.fromISO(evt.startDate).toFormat('dd-MM-yyyy')} - ${DateTime.fromISO(evt.endDate).toFormat('dd-MM-yyyy')}`,
      }))));
  }, 1_000), []);

  useEffect(() => {
    fetchAndSetEventsDebounced();
  }, [fetchAndSetEventsDebounced, userLocation]);

  return (
    <div>
      <EventHeader tabKey="by-location" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <MapComponent
          ref={mapRef}
          defaultCenter={userLocation}
          onCenterChange={onCenterChangeDebounced}
          defaultZoomLevel={5}
          markerLocations={markerLocations}
          handlePanAndZoom={fetchAndSetEventsDebounced}
        />
        <p
          className="fs-3 text-light mt-4 mb-3 text-center"
        >
          Click on a pin for info
        </p>
        <Row className="justify-content-md-center">
          {events.map((eventDetail, i, arr) => {
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
    </div>
  );
}

export default EventsByLocation;
