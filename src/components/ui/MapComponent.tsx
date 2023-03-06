/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TileLayer, Marker, Popup, MapContainer, useMapEvents, FeatureGroup,
} from 'react-leaflet';
import {
  Alert,
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Leaflet, { LatLngLiteral } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ErrorMessageList from './ErrorMessageList';
import { MarkerLocationType } from '../../types';

// Sample markers data for PR reviewing/testing/debugging
// const latLngs = [
//   { lat: 41.045877, lng: -74.94479 },
//   { lat: 41.048899, lng: -74.947958 },
//   { lat: 41.045877, lng: -74.99479 },
// ];

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
  markerLocations: Array<MarkerLocationType>,
}

function MapComponent({
  defaultCenter, defaultZoomLevel, onCenterChange, markerLocations,
}: Props) {
  const [center, setCenter] = useState<LatLngLiteral>(defaultCenter);
  const [errors, setErrors] = useState<string[]>([]);
  const [
    resolvedSearchLocationDisplayName, setResolvedSearchLocationDisplayName,
  ] = useState<string | null>(null);
  const [lastLocationSearchQuery, setLastLocationSearchQuery] = useState<string>('');
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const mapRef = useRef<Leaflet.Map>(null);
  const featureGroupRef = useRef<Leaflet.FeatureGroup>(null);

  // Whenever center changes, call onCenterChange
  useEffect(() => {
    onCenterChange(center);
  }, [center, onCenterChange]);

  const detectLocation = () => {
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

  useEffect(() => {
    if (!featureGroupRef.current || !mapRef.current) { return; }
    mapRef.current.fitBounds(featureGroupRef.current.getBounds());
  }, [markerLocations]);

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
      <Map
        key={`${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={defaultZoomLevel}
        bounds={markerLocations.map((ml) => [ml.latLng.lat, ml.latLng.lng])}
        ref={mapRef}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=SLcHU7I1RZjHoCZGIbr6"
          attribution={'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
        />

        <FeatureGroup
          ref={featureGroupRef}
        >
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
        </FeatureGroup>

        {/* For development only */}
        {/* { enableDevFeatures && <MapDebugger /> } */}
      </Map>
    </div>
  );
}

export default MapComponent;
