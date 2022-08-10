import React, { useState } from 'react';
import {
  Button,
  Col,
  Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlaceHeader from '../PlaceHeader';
import MapImage from '../../../images/place-map.jpg';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import LocationImage from '../../../images/location-feature.jpg';

const MapLocation = styled.div`
  aspectRetio : 3.56rem;
`;
const Circle = styled.div`
  width:1.25rem;
  height:1.25rem;
  background:${(p) => p.color};
`;
const StyledCast = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;

  .casts-image {
    aspect-ratio: 1.78;
  }
  &::-webkit-scrollbar {
    display: none;
}
`;
const placeCategory = [
  { id: 1, category: 'Haunted houses', color: '#0047FF' },
  { id: 2, category: 'Haunted Hayrides', color: '#FF9A00' },
  { id: 3, category: 'Pumpkin Patch', color: '#00FF0A' },
  { id: 4, category: 'Corn Mazes', color: '#C900FF' },
  { id: 5, category: 'Ghost Tours', color: '#FE0000' },
  { id: 6, category: 'Escape Rooms', color: '#01C2FF' },
];
const locationList = [
  {
    id: 11, image: LocationImage, title: 'Grim Trails Haunted Attraction', category: 'Haunted Houses',
  },
  {
    id: 12, image: LocationImage, title: 'Grim Trails Haunted Attraction', category: 'Haunted Houses',
  },
  {
    id: 13, image: LocationImage, title: 'Grim Trails Haunted Attraction', category: 'Haunted Houses',
  },
];
function PlaceLocation() {
  const [search, setSearch] = useState<string>('');
  const slideCastsLeft = () => {
    const slider = document.getElementById('slideCasts');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const slideCastsRight = () => {
    const slider = document.getElementById('slideCasts');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <PlaceHeader />
      <div>
        <MapLocation>
          <Image src={MapImage} alt="Google map" className="h-100 w-100 rounded" />
        </MapLocation>
        <div className="mt-4 d-flex justify-content-between">
          {placeCategory.map((place) => (
            <div key={place.id} className="d-flex me-2">
              <Circle color={place.color} className="rounded-circle me-1" />
              <p className="fs-5">{place.category}</p>
            </div>
          ))}
        </div>
        <CustomSearchInput label="Find haunted places near you" setSearch={setSearch} search={search} />
        <div className="bg-dark p-4 mt-3 rounded">
          <div className="d-flex justify-content-between">
            <h1 className="h2">Featured places</h1>
            <p className="fs-3 text-primary">Get featured</p>
          </div>
          <div className="d-flex align-items-center mt-3">
            <Button className="ps-0 prev bg-transparent border-0 shadow-none text-white" onClick={slideCastsLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
            </Button>
            <StyledCast
              id="slideCasts"
              className="d-flex flex-nowrap w-100"
            >
              {locationList.map((location: any) => (
                <Col md={6} key={location.id}>
                  <div className="casts-image position-relative">
                    <Image src={location.image} className="w-100 h-100 rounded" />
                  </div>
                  <div>
                    {location.title}
                  </div>
                  <div>
                    {location.category}
                  </div>
                </Col>
              ))}
            </StyledCast>
            <Button className="pe-0 next bg-transparent border-0 shadow-none text-white" onClick={slideCastsRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceLocation;
