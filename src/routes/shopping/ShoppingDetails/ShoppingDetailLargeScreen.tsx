import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Image, Row,
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
  top: 0;
  left: 6.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 0.063rem solid #3A3B46;
`;
function ShoppingDetailLargeScreen({ toggle, onToggleClick }: Props) {
  return (

    <Row className="d-flex ms-3">
      <CustomCol md={3} lg={12} xl="auto" className="position-relative">
        <PlaceProfileImage src={profileImage} className="rounded-circle" />
        <div className="position-relative">
          <LinearIcon role="button" uniqueId="favorite-lg" className="d-flex flex-column align-items-center mt-4">
            <div className="favorite-icon align-items-center bg-white d-flex justify-content-center rounded-circle ">
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
              <FavoriteIconDiv
                role="button"
                className="align-items-center bg-black d-flex justify-content-center position-absolute rounded-circle"
              >
                <FontAwesomeIcon icon={solid('times')} size="lg" className="text-primary " onClick={() => onToggleClick(!toggle)} />
              </FavoriteIconDiv>
            )}
        </div>
      </CustomCol>
      <Col className="w-100 mt-md-4">
        <div className="d-flex justify-content-between">
          <div className="mt-4 mt-md-0 ps-md-0">
            <h1>Cavity Colors</h1>
          </div>
          <div className="rating align-items-center d-flex">
            <span className="fs-3 me-3 d-flex mt-2">
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
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <div>
            <div className="d-flex">
              <FontAwesomeIcon icon={solid('globe')} size="lg" className="my-1 me-2 text-primary" />
              <p className="fs-4">www.websitename.com</p>
            </div>
            <div className="d-flex">
              <FontAwesomeIcon icon={solid('envelope')} size="lg" className="my-1 me-2 text-primary" />
              <p className="fs-4">info@websitename.com</p>
            </div>
            <div className="d-flex">
              <FontAwesomeIcon icon={solid('location-dot')} size="lg" className="my-1 me-2 text-primary" />
              <div>
                <p className="fs-4 mb-0">3500 Lemp Avenue,</p>
                <p className="fs-4 mb-0">St. Louis, MO 12345</p>
                <p className="fs-4">USA  (7802.07 mi)</p>
              </div>
            </div>
            <div className="d-flex">
              <FontAwesomeIcon icon={solid('phone')} size="lg" className="my-1 me-2 text-primary" />
              <p className="fs-4">(905) 308-9155</p>
            </div>
          </div>
          <div>
            <StyleBorderButton className="d-flex align-self-center rate-btn bg-black py-2" variant="lg">
              <FontAwesomeIcon icon={solid('share-nodes')} className="align-self-center me-2" />
              <h1 className="h3 m-0">Share</h1>
            </StyleBorderButton>
          </div>
        </div>

      </Col>
    </Row>
  );
}

export default ShoppingDetailLargeScreen;
