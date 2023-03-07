/* eslint-disable max-lines */
import React, {
  useEffect, useMemo, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import { LatLngLiteral } from 'leaflet';
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
import { EVENTS_MAP_CENTER } from '../../../constants';
import { getEventsByDistance } from '../../../api/eventByDistance';
import { LocationPointType } from '../../../types';

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
  const [center, setCenter] = useState<LatLngLiteral>(EVENTS_MAP_CENTER);
  const [events, setEvents] = useState<EventType[]>([]);
  const bp = useBootstrapBreakpointName();
  const onCenterChangeDebounced = useMemo(() => _.debounce(
    (newCenter: LatLngLiteral) => setCenter(
      { lat: Number(newCenter.lat), lng: Number(newCenter.lng) },
    ),
    500,
  ), [setCenter]);
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

  useEffect(() => {
    const maxDistanceMiles = 300;
    getEventsByDistance(center.lat, center.lng, maxDistanceMiles)
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
  }, [center]);

  return (
    <div>
      <EventHeader tabKey="by-location" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <MapComponent
          defaultCenter={center}
          // eslint-disable-next-line max-len
          onCenterChange={onCenterChangeDebounced}
          defaultZoomLevel={10}
          markerLocations={markerLocations}
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
