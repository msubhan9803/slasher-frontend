import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TileLayer, Marker, Popup, MapContainer,
} from 'react-leaflet';
import {
  Alert,
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Leaflet, { LatLngLiteral } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import ErrorMessageList from './ErrorMessageList';

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
`;

const iconHTML = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={solid('location-dot')} size="3x" className="text-primary" />,
);
const customMarkerIcon = new Leaflet.DivIcon({
  html: iconHTML,
  iconAnchor: [12, 5], // [left/right, top/bottom]
});

interface Props {
  defaultCenter: LatLngLiteral,
  defaultZoomLevel: number,
  onCenterChange: (newCenter: LatLngLiteral) => void,
}

function MapComponent({ defaultCenter, defaultZoomLevel, onCenterChange }: Props) {
  const [center, setCenter] = useState<LatLngLiteral>(defaultCenter);
  const [errors, setErrors] = useState<string[]>([]);
  const [
    resolvedSearchLocationDisplayName, setResolvedSearchLocationDisplayName,
  ] = useState<string | null>(null);
  const [lastLocationSearchQuery, setLastLocationSearchQuery] = useState<string>('');
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');

  // Whenever center changes, call onCenterChange
  useEffect(() => {
    onCenterChange(center);
  }, [center]);

  const detectLocation = () => {
    const onError = () => {
      setErrors(['Geolocation feature is unavailable, possibly due to permission settings.']);
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

  const lookUpLocation = async (locationString: string) => {
    let query = locationString;

    // Query Correction for massachusetts search
    if (query.toLowerCase().replaceAll(' ', '').endsWith(',ma')) {
      query = `${query.trim()}ssachusetts`;
    }

    return (await axios.post(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
    )).data;
  };

  const setMapLocationFromLocationSearchQuery = async () => {
    if (locationSearchQuery === lastLocationSearchQuery) {
      // To reduce API calls, only perform lookup if query is different than last search.
      // This prevents a double search if someone presses enter more than once in the search input.
      return;
    }
    setLastLocationSearchQuery(locationSearchQuery);
    setErrors([]);
    setResolvedSearchLocationDisplayName(null);

    if (locationSearchQuery === '') {
      return;
    }

    const results = await lookUpLocation(locationSearchQuery);
    if (results.length > 0) {
      const firstResult = results[0];
      setResolvedSearchLocationDisplayName(firstResult.display_name);
      setCenter({ lat: firstResult.lat, lng: firstResult.lon });
    } else {
      setErrors(['Unable to find entered location.']);
    }
  };

  return (
    <div>
      <Row className="align-items-center mb-4">
        <Col sm={4} md={3} lg={6} xl={4}>
          <Button onClick={detectLocation} className="w-100">Detect my location</Button>
        </Col>
        <Col sm={8} md={9} lg={6} xl={8}>
          <Form>
            <InputGroup className="mt-3 mt-sm-0">
              <Form.Control
                placeholder="Enter a location (example: Salem, Massachusetts)"
                aria-label="Location"
                aria-describedby="location-search-button"
                value={locationSearchQuery}
                onChange={(e) => { setLocationSearchQuery(e.target.value); }}
              />
              <Button
                type="submit"
                variant="primary"
                id="location-search-button"
                onClick={(e) => { e.preventDefault(); setMapLocationFromLocationSearchQuery(); }}
              >
                <FontAwesomeIcon icon={solid('search')} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      {
        errors.length > 0
        && (
          <ErrorMessageList errorMessages={errors} />
        )
      }
      {
        resolvedSearchLocationDisplayName
        && (
          <Alert variant="info">
            <strong>Showing:</strong>
            {' '}
            {resolvedSearchLocationDisplayName}
          </Alert>
        )
      }
      <Map
        key={`${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={defaultZoomLevel}
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
    </div>
  );
}

export default MapComponent;
