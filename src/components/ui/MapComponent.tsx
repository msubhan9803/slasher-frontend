import React, {
  useEffect, useRef, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  TileLayer, Marker, Popup, MapContainer,
} from 'react-leaflet';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Leaflet from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';

interface MapLocation {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

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

function MapComponent({ center, ZOOM_LEVEL, setCenter }: any) {
  const mapRef = useRef() as any;
  const [locationName, setLocationName] = useState<MapLocation[]>();
  const [searchLocation, setSearchLocation] = useState<string>('');

  function handleOnLocationFound(event: any) {
    const { current = {} } = mapRef;
    const { latlng } = event;
    const radius = event.accuracy;
    const circle = Leaflet.circle(latlng, radius);

    circle.addTo(current);
    setCenter(latlng);
  }
  const getLocation = () => {
    const { current = {} } = mapRef;

    current.locate({
      setView: true,
    });
    current.on('locationfound', handleOnLocationFound);
    return () => {
      current.off('locationfound', handleOnLocationFound);
    };
  };

  const getSearchData = () => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchLocation}`;
    axios.post(url).then((res) => {
      setLocationName(res.data);
    });
  };

  useEffect(() => { if (searchLocation !== '') getSearchData(); }, [searchLocation]);

  const handleLocationData = (location: React.ChangeEvent<HTMLInputElement>) => {
    if (location.target.value) {
      setSearchLocation(location.target.value);
      getSearchData();
    } else {
      setSearchLocation('');
    }
  };

  const updateLocation = (selectedLocation: MapLocation) => {
    setSearchLocation(selectedLocation.display_name);
    setCenter([selectedLocation.lat, selectedLocation.lon]);
  };
  return (
    <div>
      <Row className="align-items-center">
        <Col sm={4} md={3} lg={6} xl={4} className="mb-4">
          <Button onClick={getLocation} className="w-100">Detect my location</Button>
        </Col>
        <Col sm={8} md={9} lg={6} xl={8} className="mb-4">
          <Form.Control
            placeholder="Enter a location…"
            className="fs-5 me-2"
            value={searchLocation}
            onChange={handleLocationData}
          />

          {locationName && locationName.length > 0
            && (
              <div className="bg-white text-black p-2">
                {locationName.map((s: MapLocation) => (
                  <div
                    key={s.place_id}
                    role="button"
                    onClick={() => updateLocation(s)}
                    onKeyUp={() => updateLocation(s)}
                    tabIndex={0}
                  >
                    <h4>
                      {
                        s.display_name.charAt(0).toUpperCase()
                        + s.display_name.slice(1).toLowerCase()
                      }
                    </h4>
                  </div>
                ))}
              </div>
            )}
        </Col>
      </Row>
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
    </div>
  );
}

export default MapComponent;
