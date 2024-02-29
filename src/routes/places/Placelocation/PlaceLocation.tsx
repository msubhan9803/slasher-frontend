import React, { useState } from 'react';
import {
  Button,
  Col,
  Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import PlaceHeader from '../PlaceHeader';
import MapImage from '../../../images/place-map.jpg';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import LocationImage from '../../../images/location-feature.jpg';
import { byLocation } from '../PlaceData';
import PlacePosterCard from './PlacePosterCard';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlaceRightSidebar from '../PlaceRightSidebar';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

const MapLocation = styled.div`
  aspectRetio : 3.56rem;
`;
const Circle = styled.div`
  width:1.25rem;
  height:1.25rem;
  background:${(p) => p.color};
`;
const StyledLocation = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;

  .location-image {
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
    id: 12, image: LocationImage, title: 'High Desert Haunted House', category: 'Haunted Houses',
  },
  {
    id: 13, image: LocationImage, title: 'Evil on Erie ', category: 'Escape Rooms',
  },
  {
    id: 14, image: LocationImage, title: 'Haunt for Hope ', category: 'Ghost Tours',
  },
];

function PlaceLocation() {
  const [search, setSearch] = useState<string>('');

  const slideLocationLeft = () => {
    const slider = document.getElementById('slideLocation');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };
  const slideLocationRight = () => {
    const slider = document.getElementById('slideLocation');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <PlaceHeader tabKey="by-location" />
        <div className="mt-4">
          <div className="bg-dark p-4 pb-0 mt-3  rounded-3 mb-3 d-block d-md-none">
            <div className="d-flex justify-content-between">
              <h1 className="h2">Featured places</h1>
              <p className="fs-3 text-primary">Get featured</p>
            </div>
            <div className="d-flex align-items-center mt-3">
              <Button variant="link" className="d-none d-md-block ps-0 prev shadow-none" onClick={slideLocationLeft}>
                <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
              </Button>
              <StyledLocation
                id="slideLocation"
                className="d-flex flex-nowrap w-100"
              >
                {locationList.map((location: any) => (
                  <Col xs={6} key={location.id} className="order-sm-0">
                    <div className="location-image position-relative">
                      <Image src={location.image} className="w-100 h-100 rounded" />
                    </div>
                    <h1 className="h3 mt-3 mb-2">{location.title}</h1>
                    <p className="fs-4 text-primary">{location.category}</p>
                  </Col>
                ))}
              </StyledLocation>
              <Button variant="link" className="d-none d-md-block pe-0 next shadow-none" onClick={slideLocationRight}>
                <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
              </Button>
            </div>
          </div>
          <MapLocation>
            <Image src={MapImage} alt="Google map" className="h-100 w-100 rounded" />
          </MapLocation>
          <div className="mt-4 d-none d-md-flex d-lg-none d-xl-flex justify-content-between">
            {placeCategory.map((place) => (
              <div key={place.id}>
                <div className="d-flex me-2">
                  <Circle color={place.color} className="rounded-circle me-1" />
                  <p className="fs-5">{place.category}</p>
                </div>
              </div>
            ))}
          </div>
          <Row className="mt-4 d-md-none d-lg-flex d-xl-none justify-content-between">
            {placeCategory.map((place) => (
              <Col xs={6} key={place.id}>
                <div className="d-flex me-2">
                  <Circle color={place.color} className="rounded-circle me-1" />
                  <p className="fs-5">{place.category}</p>
                </div>
              </Col>
            ))}
          </Row>
          <div className="mt-2 mt-md-0">
            <CustomSearchInput label="Find haunted places near you" setSearch={setSearch} search={search} />
          </div>
          <div className="bg-dark p-4 mt-3 mx-2 mx-md-0 rounded-3 mb-2 d-none d-md-block">
            <div className="d-flex justify-content-between">
              <h1 className="h2">Featured places</h1>
              <p className="fs-3 text-primary">Get featured</p>
            </div>
            <div className="d-flex align-items-center mt-3">
              <Button variant="link" className="d-none d-md-block ps-0 prev shadow-none" onClick={slideLocationLeft}>
                <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
              </Button>
              <StyledLocation
                id="slideLocation"
                className="d-flex flex-nowrap w-100"
              >
                {locationList.map((location: any) => (
                  <Col xs={6} key={location.id} className="order-sm-0">
                    <div className="location-image position-relative">
                      <Image src={location.image} className="w-100 h-100 rounded" />
                    </div>
                    <h1 className="h3 mt-3 mb-2">{location.title}</h1>
                    <p className="fs-4 text-primary">{location.category}</p>
                  </Col>
                ))}
              </StyledLocation>
              <Button variant="link" className="d-none d-md-block pe-0 next shadow-none" onClick={slideLocationRight}>
                <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
              </Button>
            </div>
          </div>
          <div>
            <Row className="justify-content-md-center mx-md-3">
              {byLocation.map((eventDetail) => (
                <Col md={6} key={eventDetail.id}>
                  <PlacePosterCard
                    listDetail={eventDetail}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlaceLocation;
