/* eslint-disable react/destructuring-assignment */
/* eslint-disable max-lines */
import React, {
  useCallback,
  useEffect, useMemo, useRef, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TileLayer, Marker, Popup, MapContainer, useMapEvents,
} from 'react-leaflet';
import {
  Alert, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Leaflet, { LatLngLiteral } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import ErrorMessageList from './ErrorMessageList';
import { MarkerLocationType } from '../../types';
import RoundButton from './RoundButton';
import { LG_MEDIA_BREAKPOINT } from '../../constants';

const lookUpLocation = async (locationString: string) => {
  let query = locationString;

  // Query Correction for massachusetts search
  if (query?.toLowerCase()?.replaceAll(' ', '')?.endsWith(',ma')) {
    query = `${query.trim()}ssachusetts`;
  }

  return (await axios.post(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
  )).data;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MapDebugger() {
  const map = useMapEvents({
    click: (e) => {
      map.locate();
      // eslint-disable-next-line no-console
      console.log('clicked location?', e.latlng.toString());
    },
  });
  return null;
}

type RegisterPanZoomProps = {
  handlePanAndZoom: Function;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  zoomThreshold: number;
};
function RegisterPanAndZoomEvents({
  handlePanAndZoom, setMessage, zoomThreshold,
}: RegisterPanZoomProps) {
  const handlePanAndZoomFn = useCallback((map: Leaflet.Map) => {
    if (map.getZoom() < zoomThreshold) {
      setMessage('You are too far out, please zoom in');
    } else {
      setMessage(null);
      handlePanAndZoom();
    }
  }, [handlePanAndZoom, setMessage, zoomThreshold]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const map = useMapEvents({
    moveend: () => {
      handlePanAndZoomFn(map);
    },
    zoomend: () => {
      handlePanAndZoomFn(map);
    },
  });
  return null;
}

const Map = styled(MapContainer)`
  height: 450px;
  width: 100%;
  z-index:0;
  .leaflet-div-icon {
    background: transparent;
    border: none;
  }
  .leaflet-popup-content{
    margin: 1rem 1.5rem;
  }
  .leaflet-popup {
    bottom : 0 !important;
  }
  .leaflet-control-zoom {
    margin-top: 30px;
  }
`;

const iconHTML = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={solid('location-dot')} size="3x" className="text-primary" />,
);
const customMarkerIcon = new Leaflet.DivIcon({
  html: iconHTML,
  iconAnchor: [12, 5], // [left/right, top/bottom]
});
const userIconHTML = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={solid('location-crosshairs')} size="3x" className="text-secondary" />,
);
const userMarkerIcon = new Leaflet.DivIcon({
  html: userIconHTML,
  iconAnchor: [12, 5], // [left/right, top/bottom]
});

interface Props {
  defaultCenter: LatLngLiteral,
  defaultZoomLevel: number,
  onCenterChange: (newCenter: LatLngLiteral) => void,
  markerLocations: Array<MarkerLocationType>,
  handlePanAndZoom: Function,
  zoomThreshold: number;
}

const MapNotifiyMessage = styled.div`
  margin-bottom: -22px;
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    margin-bottom: -23px;
  }
  color: white;
  position: relative;
  background: rgb(0 0 0 / 51%);
  z-index: 1;
  padding: 0px 25px;
`;

function MapComponent({
  defaultCenter, defaultZoomLevel, onCenterChange, markerLocations, handlePanAndZoom, zoomThreshold,
}: Props, mapRef: any) {
  const [center, setCenter] = useState<LatLngLiteral>(defaultCenter);
  const [errors, setErrors] = useState<string[]>([]);
  const [
    resolvedSearchLocationDisplayName, setResolvedSearchLocationDisplayName,
  ] = useState<string | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const lastLocationQueryRef = useRef('');
  const [mapNotifiyMessage, setMapNotifiyMessage] = useState<string | null>(null);

  const setMapLocationFromLocationSearchQueryNew = useMemo(() => debounce(
    async (value: string) => {
      if ((value === '') || (value === lastLocationQueryRef.current)) {
        // To reduce API calls, only perform lookup if query is different than last search.
        // Prevents a double search if someone presses enter more than once in the search input.
        return;
      }
      lastLocationQueryRef.current = value;
      setErrors([]);
      setResolvedSearchLocationDisplayName(null);

      const results = await lookUpLocation(value);
      if (results.length > 0) {
        const firstResult = results[0];
        setResolvedSearchLocationDisplayName(firstResult.display_name);
        setCenter({ lat: firstResult.lat, lng: firstResult.lon });
      } else {
        setErrors(['Unable to find entered location.']);
      }
    },
    500,
  ), []);

  // Whenever center changes, call onCenterChange
  useEffect(() => {
    onCenterChange(center);
  }, [center, onCenterChange]);

  const detectLocation = () => {
    // Reset location search input
    setLocationSearchQuery('');
    setResolvedSearchLocationDisplayName(null);

    const onError = () => {
      setErrors(['Geolocation feature unavailable. Please update your device\'s permissions to enable location access.']);
    };

    if (navigator.geolocation) {
      setErrors([]);
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
      }, onError);
    } else {
      onError();
    }
  };

  return (
    <div>
      <Row className="align-items-center mb-4">
        <Col className="p-2" sm={12} xl={7}>
          <Form>
            <InputGroup className="mt-3 mt-sm-0">
              <Form.Control
                className="rounded-pill"
                placeholder="Enter a location"
                aria-label="Location"
                aria-describedby="location-search-button"
                value={locationSearchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  e.preventDefault();
                  setLocationSearchQuery(e.target.value);
                  // (todo: rename this) this is to be called with debounce!
                  setMapLocationFromLocationSearchQueryNew(e.target.value);
                }}
              />
            </InputGroup>
          </Form>
        </Col>
        <Col className="p-2 text-center" sm={12} xl={1}>Or</Col>
        <Col className="p-2" sm={12} xl={4}>
          <RoundButton onClick={detectLocation} className="w-100 text-nowrap d-flex align-items-center justify-content-center px-3">
            <FontAwesomeIcon size="lg" icon={solid('location-crosshairs')} className="text-secondary px-2" />
            <div>Use your location</div>
          </RoundButton>
        </Col>
      </Row>
      <ErrorMessageList errorMessages={errors} className="my-4" />
      {
        resolvedSearchLocationDisplayName
        && (
          <Alert variant="info" className="my-4">
            <strong>Showing:</strong>
            {' '}
            {resolvedSearchLocationDisplayName}
          </Alert>
        )
      }
      {mapNotifiyMessage && <MapNotifiyMessage>{mapNotifiyMessage}</MapNotifiyMessage>}
      <Map
        key={`${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={defaultZoomLevel}
        ref={mapRef}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=SLcHU7I1RZjHoCZGIbr6"
          attribution={'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
        />

        {markerLocations.map((markerDetails) => (
          <Marker
            key={markerDetails.id}
            position={markerDetails.latLng}
            icon={customMarkerIcon}
          >
            <Popup>
              <div>
                <p className="fs-5 fw-normal mb-3 ">{markerDetails.dateRange}</p>
                <div className="d-flex align-items-baseline">
                  <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="lg" />
                  <span className="fs-3 fw-normal mb-2">{markerDetails.address}</span>
                </div>
                <h1 className="h3 fw-bold">{markerDetails.name}</h1>
                <Link to={markerDetails.linkAddress} className="text-decoration-none btn bg-transparent text-primary border-0 shadow-none p-0">
                  {markerDetails.linkText}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        <Marker
          position={center}
          icon={userMarkerIcon}
        />

        <RegisterPanAndZoomEvents
          setMessage={setMapNotifiyMessage}
          handlePanAndZoom={handlePanAndZoom}
          zoomThreshold={zoomThreshold}
        />

        {/* For development only */}
        {/* { enableDevFeatures && <MapDebugger /> } */}
      </Map>
    </div>
  );
}

export default React.forwardRef(MapComponent);
