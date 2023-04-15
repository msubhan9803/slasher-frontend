import React from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import DownloadMobileApp from '../../../images/download-slasher-mobile.png';

function DownloadAppSection() {
  return (
    <div className="mx-3 mx-lg-4 px-2">
      <div className="bg-primary rounded-3 pt-5 px-4 text-black">
        <span className="text-center">
          <h1 className="fw-bolder" style={{ fontSize: '1.75rem' }}>SLASHER</h1>
          <h2 className="fw-bolder h1" style={{ fontSize: '1.75rem' }}>THE SOCIAL NETWORK FOR HORROR™</h2>
        </span>
        <Row className="mt-3 align-items-center">
          <Col xs={6} md={4} className="text-md-end">
            <h3 className="fw-bold h2 mb-3">GET IT TODAY ON</h3>
            <h4 className="fw-bolder h1 mb-3">Google Play</h4>
            <h5 className="fw-bold h2 mb-3">IT&#39;S FREE!</h5>
            <a href="https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en&pli=1" target="_blank" rel="noreferrer">
              <Image fluid src={PlayStoreImage} alt="play store" />
            </a>
          </Col>
          <Col md={4} className="d-none d-md-block text-center">
            <Image fluid src={DownloadMobileApp} alt="download mobile" />
          </Col>
          <Col xs={6} md={4}>
            <h3 className="fw-bold h2 mb-3">DOWNLOAD TODAY</h3>
            <h4 className="fw-bolder h1 mb-3">iOS</h4>
            <h5 className="fw-bold h2 mb-3">IT&#39;S FREE!</h5>
            <div>
              <a href="https://apps.apple.com/app/id1458216326" target="_blank" className="mb-3 mb-md-0 me-0 me-md-3" rel="noreferrer">
                <Image fluid src={AppStoreImage} alt="app store" className="ios-badge" />
              </a>
            </div>
          </Col>
        </Row>
        <div className="d-md-none d-flex justify-content-center">
          <Image fluid src={DownloadMobileApp} alt="play store" />
        </div>
      </div>
    </div>
  );
}

export default DownloadAppSection;
