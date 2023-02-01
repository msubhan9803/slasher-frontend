import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import profileImage from '../../../images/shopping-profile.png';
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
const PlaceProfileImage = styled(Image)`
  border: 4px solid #1B1B1B;
  height: 11.25rem;
  width: 11.25rem;
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
          <div className="mt-4 mt-md-0 ps-md-0">
            <h1>Cavity Colors</h1>
          </div>
          <div className="rating align-items-center d-flex">
            <span className="fs-3 me-3 d-flex mt-2">
              <CustomStarIcon />
              <div className="d-flex">
                <h1 className="h2 m-0 mx-2">3.3/5</h1>
                <p className="fs-3 m-0 text-light">(10K)</p>
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
            <BorderButton
              buttonClass="d-flex"
              variant="lg"
              icon={solid('share-nodes')}
              iconClass="align-self-center me-2"
              lable="Share"
            />
          </div>
        </div>

      </Col>
    </Row>
  );
}

export default ShoppingDetailLargeScreen;
