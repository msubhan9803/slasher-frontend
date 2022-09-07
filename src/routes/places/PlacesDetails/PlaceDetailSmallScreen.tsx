import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import postImage from '../../../images/places-post.jpg';
import LikeDislike from './LikeDislike';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  toggle: boolean;
  onToggleClick: (val: boolean) => void;
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
  .favorite-icon{
    height:3.57rem;
    width:3.57rem;
  }
`;

const CustomCol = styled(Col)`
  margin-top: -3.938rem;
`;
const PlaceProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;
const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
const StyledStar = styled(FontAwesomeIcon)`
  color: #FF8A00;
  width: 1.638rem;
  height: 1.563rem;
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
const FavoriteIconDiv = styled.div`
  margin-top: 1.429rem;
  margin-left: 3.214rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid #3A3B46;
`;
const StyledBorder = styled.div`
  border-top: 1px solid #3A3B46
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
              <FavoriteIconDiv
                className="position-absolute bg-black rounded-circle text-center"
              >
                <FontAwesomeIcon icon={solid('times')} size="lg" className="text-primary text-center" onClick={() => onToggleClick(!toggle)} />
              </FavoriteIconDiv>
            )}

        </div>
        <div className="rating align-items-center d-flex my-3 justify-content-center">
          <span className="fs-3 me-3 me-xxl-2 align-self-center d-flex justify-content-end">
            <StyledStar icon={solid('star')} size="xs" className="star mb-2" />
            <div className="d-flex">
              <h1 className="h2 m-0 mx-2">3.3/5</h1>
              <p className="fs-3 m-0 text-light me-xxl-2">(10K)</p>
            </div>
          </span>
          <StyleBorderButton className="d-flex align-items-center rate-btn bg-black py-2 px-3" variant="lg">
            <FontAwesomeIcon icon={regular('star')} className="align-self-center me-2" />
            <h1 className="h3 m-0">Rate</h1>
          </StyleBorderButton>
        </div>
        <StyledBorder className="mb-3" />
        <div className="align-items-center d-flex justify-content-center">
          <p className="m-0 me-1 me-sm-3 fs-3 fw-bold">Worth going?</p>
          <LikeDislike />
        </div>
        <div className="mt-4 d-flex justify-content-center align-items-center">
          <StyledWorth className="me-3 align-items-center d-flex justify-content-center ">
            <div className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center">
              <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" />
            </div>
            <p className="fs-2 fw-bold m-0">Worth it!</p>
          </StyledWorth>
          <StyleBorderButton className="d-flex align-self-center rate-btn bg-black py-2" variant="lg">
            <FontAwesomeIcon icon={solid('share-nodes')} className="align-self-center me-2" />
            <h1 className="h3 m-0">Share</h1>
          </StyleBorderButton>
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
