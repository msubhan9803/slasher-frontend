import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import postImage from '../../../images/places-post.jpg';
import LikeDislike from './LikeDislike';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import BorderButton from '../../../components/ui/BorderButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import CustomStarIcon from '../../../components/ui/CustomStarIcon';
import CustomFavoriteIcons from '../../../components/ui/CustomFavoriteIcons';
import { LinearIcon } from '../../../components/ui/FavoriteLinearIcon';
import WorthContent from '../../../components/ui/WorthContent';

interface Props {
  toggle: boolean;
  onToggleClick: (val: boolean) => void;
}

const CustomCol = styled(Col)`
  margin-top: -3.938rem;
`;
const PlaceProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;

function PlaceDetailSmallScreen({ toggle, onToggleClick }: Props) {
  return (
    <Row className="d-flex">
      <CustomCol md={3} lg={12} xl="auto" className="text-center text-lg-center text-xl-start  position-relative">
        <PlaceProfileImage size="11.25rem" src={postImage} />
        <div className="d-md-none text-center text-md-start text-lg-center text-xl-start  mt-3 mt-md-0 ps-md-0">
          <p className="fs-5">July 28,2022  - July 28,2022 </p>
          <h1 className="h2">High Desert Haunted House</h1>
          <p className="fs-4 text-primary mb-0">Escape Rooms</p>
        </div>
        <div className="d-flex justify-content-center position-relative ">
          <LinearIcon role="button" uniqueId="favorite" className="d-flex flex-column align-items-center mt-4">
            <Button onClick={() => onToggleClick(!toggle)} className="favorite-icon d-flex align-items-center bg-white d-flex justify-content-center rounded-circle ">
              <FontAwesomeIcon icon={solid('heart')} size="2x" />
            </Button>
            <h1 className="h5 mt-2 mb-0">Favorite</h1>
            <svg width="0" height="0">
              <linearGradient id="favorite" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
                <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
              </linearGradient>
            </svg>
          </LinearIcon>
          {toggle
            && (
              <CustomFavoriteIcons
                handleRemoveFavorite={onToggleClick}
                favorite={toggle}
                buttonClass="position-absolute bg-black rounded-circle text-center"
                iconClass="text-primary text-center"
                mobileView
              />
            )}

        </div>
        <div className="rating align-items-center d-flex my-3 justify-content-center">
          <span className="fs-3 me-3 me-xxl-2 align-self-center d-flex justify-content-end">
            <CustomStarIcon />
            <div className="d-flex">
              <h1 className="h2 m-0 mx-2">3.3/5</h1>
              <p className="fs-3 m-0 text-light me-xxl-2">(10K)</p>
            </div>
          </span>
          <BorderButton
            buttonClass="d-flex px-3"
            variant="lg"
            icon={regular('star')}
            iconClass="align-self-center me-2"
            lable="Rate"
          />
        </div>
        <StyledBorder className="mb-3" />
        <div className="align-items-center d-flex justify-content-center">
          <p className="m-0 me-1 me-sm-3 fw-bold">Worth going?</p>
          <LikeDislike />
        </div>
        <div className="mt-4 d-flex justify-content-center align-items-center">
          <WorthContent />
          <BorderButton
            buttonClass="d-flex"
            variant="lg"
            icon={solid('share-nodes')}
            iconClass="align-self-center me-2"
            lable="Share"
          />
        </div>
        <StyledBorder className="mt-3" />
        <div className="d-flex mt-4">
          <FontAwesomeIcon icon={solid('location-dot')} size="lg" className="my-1 me-2 text-primary" />
          <div className="text-start">
            <p className="fs-4 mb-0">3500 Lemp Avenue,</p>
            <p className="fs-4 mb-0">St. Louis, MO 12345</p>
            <p className="fs-4">USA (7802.07 mi)</p>
          </div>
        </div>
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('globe')} size="lg" className="my-1 me-2 text-primary" />
          <p className="fs-3">www.websitename.com</p>
        </div>

        <StyledBorder className="mt-3 mb-4" />
      </CustomCol>
    </Row>
  );
}

export default PlaceDetailSmallScreen;
