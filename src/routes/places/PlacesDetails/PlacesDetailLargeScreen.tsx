import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import postImage from '../../../images/places-post.jpg';
import LikeDislike from './LikeDislike';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import BorderButton from '../../../components/ui/BorderButton';
import CustomStarIcon from '../../../components/ui/CustomStarIcon';
import CustomFavoriteIcons from '../../../components/ui/CustomFavoriteIcons';
import { LinearIcon } from '../../../components/ui/FavoriteLinearIcon';

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
const StyledWorth = styled.div`
  color: #00FF0A;
  div {
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid #3A3B46;
    background: #1F1F1F;
  }
  FontAwesomeIcon {
    width: 1.326rem;
    height: 1.391rem;
  }
`;
function PlacesDetailLargeScreen({ toggle, onToggleClick }: Props) {
  return (

    <Row className="d-flex ms-3">
      <CustomCol md={3} lg={12} xl="auto" className="text-center text-lg-center text-xl-start  position-relative">
        <PlaceProfileImage size="11.25rem" src={postImage} />
        <div className="position-relative">
          <LinearIcon role="button" uniqueId="favorite-lg" className="d-flex flex-column align-items-center mt-4">
            <div className="favorite-icon d-flex align-items-center bg-white d-flex justify-content-center rounded-circle ">
              <FontAwesomeIcon role="button" icon={solid('heart')} size="2x" onClick={() => onToggleClick(!toggle)} />
            </div>
            <h1 className="h5 mt-2 mb-0">Favorite</h1>
            <svg width="0" height="0">
              <linearGradient id="favorite-lg" x1="0%" y1="0%" x2="0%" y2="100%">
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
                buttonClass="align-items-center bg-black d-flex justify-content-center position-absolute rounded-circle"
                iconClass="text-primary"
              />
            )}
        </div>
      </CustomCol>
      <Col className="w-100 mt-md-4">
        <div className="d-flex justify-content-between">
          <div className="text-center text-md-start text-lg-center text-xl-start  mt-4 mt-md-0 ps-md-0">
            <p className="fs-5">July 28,2022  - July 28,2022 </p>
            <h1 className="h2">High Desert Haunted House</h1>
          </div>
          <div className="rating align-items-center d-flex py-3 pb-xxl-0 justify-content-center">
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
        </div>
        <div>
          <p className="fs-4 text-primary">Escape Rooms</p>
        </div>
        <div className="d-flex justify-content-between">
          <div className="d-flex">
            <FontAwesomeIcon icon={solid('location-dot')} size="lg" className="my-1 me-2 text-primary" />
            <div>
              <p className="fs-4 mb-0">3500 Lemp Avenue,</p>
              <p className="fs-4 mb-0">St. Louis, MO 12345</p>
              <p className="fs-4"> USA  (7802.07 mi)</p>
            </div>
          </div>
          <BorderButton
            buttonClass="d-flex"
            variant="lg"
            icon={solid('share-nodes')}
            iconClass="align-self-center me-2"
            lable="Share"
          />
        </div>
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('globe')} size="lg" className="my-1 me-2 text-primary" />
          <p className="fs-3">www.websitename.com</p>
        </div>
        <div className="align-items-center d-flex justify-content-start">
          <p className="m-0 me-1 me-sm-3 fs-3 fw-bold">Worth going?</p>
          <LikeDislike />
        </div>
        <div className="mt-4 d-flex">
          <StyledWorth className="me-3 align-items-center d-flex">
            <div className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center">
              <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" />
            </div>
            <p className="fs-2 fw-bold m-0">Worth it!</p>
          </StyledWorth>
        </div>
      </Col>
    </Row>
  );
}

export default PlacesDetailLargeScreen;
