import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import EventsBanner from '../../../images/event-banner.svg';

interface LinearIconProps {
  uniqueId?: string
}
const EventBanner = styled.div`
  aspect-ratio : 1.78;
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
  .favorite-icon{
    height:3.57rem;
    width:3.57rem;
  }
`;
const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
const StyledBorder = styled.div`
  border-top: 1px solid #3A3B46
`;
function EventDetails() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <Row className="justify-content-center my-4 d-lg-none">
        <Col md={6}>
          <Link to="/events/suggestion">
            <RoundButton className="w-100 fs-4">Suggest event</RoundButton>
          </Link>
        </Col>
      </Row>
      <div className="bg-dark p-4 rounded">
        <EventBanner>
          <Image src={EventsBanner} alt="event banner" className="h-100 w-100" />
        </EventBanner>
        <Row className="mt-4">
          <Col md={7}>
            <p>July 28,2022  - July 28,2022 </p>
            <h2>Escape from a House of Horror - A Diane Sawyer Special Event</h2>
            <span className="text-primary">Dance</span>
          </Col>
          <Col md={5} className="d-none d-md-block d-lg-none d-xl-block">
            <LinearIcon role="button" uniqueId="favorite-lg" className="d-flex flex-column align-items-end">
              <div className="favorite-icon align-items-center bg-white d-flex justify-content-center rounded-circle ">
                <FontAwesomeIcon role="button" icon={solid('heart')} size="2x" />
              </div>
              <h1 className="h5 mt-2 mb-0">Favorite</h1>
              <svg width="0" height="0">
                <linearGradient id="favorite-lg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
                </linearGradient>
              </svg>
            </LinearIcon>
          </Col>
        </Row>
        <Row className="my-md-4 mt-2">
          <Col md={7} lg={12} xl={6} className="align-self-center">
            <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
            <span className="fs-3">1 Main St, New York, NY USA</span>
          </Col>
          <Col md={5} xl={6}>
            <div className="d-flex justify-content-between align-items-center">
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.websitename.com
              </a>
              <StyleBorderButton className="d-none d-md-flex d-lg-none d-xl-flex align-self-center rate-btn bg-black py-2" variant="lg">
                <FontAwesomeIcon icon={solid('share-nodes')} className="align-self-center me-2" />
                <h1 className="h3 m-0">Share</h1>
              </StyleBorderButton>
            </div>
          </Col>
        </Row>
        <div className="d-flex d-md-none d-lg-flex d-xl-none justify-content-between">
          <div className="d-flex align-self-center">
            <StyleBorderButton className="d-flex align-self-center rate-btn bg-black py-2" variant="lg">
              <FontAwesomeIcon icon={solid('share-nodes')} className="align-self-center me-2" />
              <h1 className="h3 m-0">Share</h1>
            </StyleBorderButton>
          </div>
          <div>
            <LinearIcon role="button" uniqueId="favorite-sm" className="d-flex flex-column align-items-end">
              <div className="favorite-icon align-items-center bg-white d-flex justify-content-center rounded-circle ">
                <FontAwesomeIcon role="button" icon={solid('heart')} size="2x" />
              </div>
              <h1 className="h5 mt-2 mb-0">Favorite</h1>
              <svg width="0" height="0">
                <linearGradient id="favorite-sm" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
                </linearGradient>
              </svg>
            </LinearIcon>
          </div>
        </div>
        <StyledBorder className="mt-3 mb-4" />
        <div>
          <p className="fs-4">
            The standard chunk of Lorem Ipsum used since the 1500s is
            reproduced below for those interested.
            Sections 1.10.32 and 1.10.33 from &quot;de Finibus Bonorum et Malorum&quot;
            by Cicero are also reproduced in their exact original form,
            accompanied by English versions from the 1914 translation by H. Rackham.
          </p>
          <b>Donate</b>
          <span className="fs-4">
            : If you use this site regularly and would like to help keep the
            site on the Internet, please consider donating a small
            sum to help pay for the hosting and bandwidth bill.
            There is no minimum donation, any sum is appreciated
          </span>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default EventDetails;
