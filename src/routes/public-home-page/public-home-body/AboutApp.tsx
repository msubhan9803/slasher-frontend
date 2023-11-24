import React from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import SlasherAbout1 from '../../../images/slasher-about-1.png';
import SlasherAbout2 from '../../../images/slasher-about-2.png';
import SlasherAbout3 from '../../../images/slasher-about-3.png';
import SlasherAbout4 from '../../../images/slasher-about-4.png';
import { SM_MEDIA_BREAKPOINT } from '../../../constants';
import DownloadStoreBadge from '../components/DownloadStoreBadge';

const StyledAbout = styled.div`
  @media (max-width: ${SM_MEDIA_BREAKPOINT}){
    .title {
      font-size: var(--fs-2) !important;
    }
  }
`;

const StyledContainer = styled.div`
  & > .row {
    max-width: 1140px;
  }
`;

function AboutApp() {
  return (
    <StyledAbout id="details" className="details mb-5 pb-1">
      <StyledContainer className="container-lg mt-5">
        <Row className="justify-content-center mb-5 pb-3 row text-center mx-auto">
          <Col md={10}>
            <h1 className="title mb-3 fw-bold">SLASHER IS THE ULTIMATE APP FOR HORROR FANS</h1>
            <p className="text-light">
              For the first time, you can experience a social platform built for horror fans by
              horror fans! Don’t miss out &#8722; join now!
            </p>
          </Col>
        </Row>
        <Row className="mx-auto content align-items-center mb-3">
          <Col md={6}>
            <Image fluid src={SlasherAbout1} className="" alt="about 1" />
          </Col>
          <Col md={6} className="pt-4 mb-md-5 text-center text-sm-start">
            <h2 className="text-primary text-uppercase h1 mb-3 fw-bold">Social Network</h2>
            <p className="pe-lg-3 text-light fs-4 mb-4">
              Slasher was built for horror fans! Now you can enjoy a friendly community with no
              censorship of bloody or gory special effects and makeup! Want to connect with other
              horror fans? Slasher makes it possible to make connections faster than any other
              social platform! The people behind Slasher are horror fans too!
            </p>
            <DownloadStoreBadge />
          </Col>
        </Row>

        <Row className="mx-auto content align-items-center mb-5 pb-4">
          <Col md={6} className="order-1 order-md-2">
            <Image fluid src={SlasherAbout2} className="" alt="about 2" />
          </Col>
          <Col md={6} className="pt-5 order-2 order-md-1 mb-md-5 text-center text-sm-start">
            <h3 className="text-primary text-uppercase h1 mb-3 fw-bold me-lg-3">
              THE LARGEST HORROR MOVIE DATABASE
            </h3>
            <p className="text-light fs-4 mb-4">
              Slasher has the largest horror movie database online! You can also find two
              unique movie rating systems on Slasher: Gore Factor and Worth It! Write reviews,
              share, get info, watch trailers, check out ratings from other Slasher members,
              and talk about thousands of horror movies from all over the world!
            </p>
            <DownloadStoreBadge />
          </Col>
        </Row>

        <Row className="mx-auto content align-items-center mb-5 pb-4">
          <Col md={6} className="">
            <Image fluid src={SlasherAbout3} className="" alt="about 3" />
          </Col>
          <Col md={6} className="pt-5 mb-md-5 text-center text-sm-start">
            <h4 className="text-primary text-uppercase h1 mb-3 fw-bold">EVENTS CALENDAR</h4>
            <p className="text-light fs-4 mb-4 me-lg-3">
              Looking for a horror convention? Maybe a film festival? Check out Slasher’s
              event calendar to see what kind of cool things are going on near you!
            </p>
            <DownloadStoreBadge />
          </Col>
        </Row>

        <Row className="mx-auto content align-items-center mb-5 pb-4">
          <Col md={6} className="order-1 order-md-2">
            <Image fluid src={SlasherAbout4} className="" alt="about 4" />
          </Col>
          <Col md={6} className="pt-5 order-2 order-md-1 mb-md-5 text-center text-sm-start">
            <h5 className="text-primary text-uppercase h1 mb-3 fw-bold">NEWS &amp; REVIEWS</h5>
            <p className="text-light fs-4 mb-4">
              If you’re interested in the latest horror news and reviews, you’ll find it all on
              Slasher! Stay up-to-date with news from some of the top websites in horror!
            </p>
            <DownloadStoreBadge />
          </Col>
        </Row>
      </StyledContainer>
    </StyledAbout>
  );
}

export default AboutApp;
