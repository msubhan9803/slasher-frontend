import React from 'react';
import {
  Col, Container, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import DownloadMobileApp from '../../../images/download-slasher-mobile.png';
import { StyledBadge } from '../components/DownloadStoreBadge';

function DownloadAppSection() {
  return (
    <Container>
      <div className="bg-primary rounded-3 pt-5 px-4 text-black">
        <span className="text-center">
          <h1>SLASHER</h1>
          <h2 className="h1">THE SOCIAL NETWORK FOR HORROR™</h2>
        </span>
        <Row className="mt-3 align-items-center">
          <Col xs={6} md={4} className="text-md-end">
            <h3 className="h2 mb-3">GET IT TODAY ON</h3>
            <h4 className="h1 mb-3">Google Play</h4>
            <h5 className="h2 mb-3">IT&#39;S FREE!</h5>
            <Link to="/">
              <Image fluid src={PlayStoreImage} alt="play store" />
            </Link>
          </Col>
          <Col md={4} className="d-none d-md-block text-center">
            <Image fluid src={DownloadMobileApp} alt="download mobile" />
          </Col>
          <Col xs={6} md={4}>
            <h3 className="h2 mb-3">DOWNLOAD TODAY</h3>
            <h4 className="h1 mb-3">iOS</h4>
            <h5 className="h2 mb-3">IT&#39;S FREE!</h5>
            <StyledBadge>
              <Link to="/" className="mb-3 mb-md-0 me-0 me-md-3 ms-2 ms-md-0">
                <Image fluid src={AppStoreImage} alt="app store" className="border ios-badge" />
              </Link>
            </StyledBadge>
          </Col>
        </Row>
        <div className="d-md-none d-flex justify-content-center">
          <Image fluid src={DownloadMobileApp} alt="play store" />
        </div>
      </div>
    </Container>
  );
}

export default DownloadAppSection;
