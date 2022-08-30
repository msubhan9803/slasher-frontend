import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import profileImage from '../../../images/shopping-profile.png';

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
const PlaceProfileImage = styled(Image)`
  border:0.25rem solid #1B1B1B;
  height:11.25rem;
  width:11.25rem;
`;
const StyleBorderButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:hover {
    border: 0.063rem solid #3A3B46;
  }
`;
const StyledStar = styled(FontAwesomeIcon)`
  color: #FF8A00;
  width: 1.638rem;
  height: 1.563rem;
`;
const FavoriteIconDiv = styled.div`
  margin-top: 1.429rem;
  margin-left: 3.214rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 0.063rem solid #3A3B46;
`;
const StyledBorder = styled.div`
  border-top: .063rem solid #3A3B46
`;

function ShoppingDetailSmallScreen({ toggle, onToggleClick }: Props) {
  return (
    <Row className="d-flex">
      <CustomCol className="text-center position-relative">
        <PlaceProfileImage src={profileImage} className="rounded-circle" />
        <div className="mt-2 mt-md-0 ps-md-0">
          <h1>Cavity Colors</h1>
        </div>
        <div className="d-flex justify-content-center position-relative ">
          <LinearIcon role="button" uniqueId="favorite" className="d-flex flex-column align-items-center mt-3">
            <Button onClick={() => onToggleClick(!toggle)} className="favorite-icon d-flex border-0  shadow-none align-items-center bg-white d-flex justify-content-center rounded-circle ">
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
        <div className="rating d-flex mt-3 mb-4 justify-content-between">
          <span className="fs-3 me-3 align-self-end d-flex justify-content-end">
            <StyledStar icon={solid('star')} size="xs" className="star mb-2" />
            <div className="d-flex">
              <h1 className="h2 m-0 mx-2">3.3/5</h1>
              <p className="fs-3 m-0 text-light">(10K)</p>
            </div>
          </span>
          <StyleBorderButton className="d-flex align-items-center rate-btn bg-black py-2 px-3" variant="lg">
            <FontAwesomeIcon icon={regular('star')} className="align-self-center me-2" />
            <h1 className="h3 m-0">Rate</h1>
          </StyleBorderButton>
          <StyleBorderButton className="d-flex align-self-center rate-btn bg-black py-2 ms-2" variant="lg">
            <FontAwesomeIcon icon={solid('share-nodes')} className="align-self-center me-2" />
            <h1 className="h3 m-0">Share</h1>
          </StyleBorderButton>
        </div>
        <StyledBorder className="mb-3" />
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('globe')} size="lg" className="my-1 me-2 text-primary" />
          <p className="fs-3">www.websitename.com</p>
        </div>
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('envelope')} size="lg" className="my-1 me-2 text-primary" />
          <p className="fs-3">info@websitename.com</p>
        </div>
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('location-dot')} size="lg" className="my-1 me-2 text-primary" />
          <div className="text-start">
            <p className="fs-4 mb-0">3500 Lemp Avenue,</p>
            <p className="fs-4 mb-0">St. Louis, MO 12345</p>
            <p className="fs-4">USA (7802.07 mi)</p>
          </div>
        </div>
        <div className="d-flex">
          <FontAwesomeIcon icon={solid('phone')} size="lg" className="my-1 me-2 text-primary" />
          <p className="fs-3 mb-0">(905) 308-9155</p>
        </div>
      </CustomCol>
    </Row>
  );
}

export default ShoppingDetailSmallScreen;
